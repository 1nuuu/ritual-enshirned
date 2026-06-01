// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {Base64} from "@openzeppelin/utils/Base64.sol";
import {Strings} from "@openzeppelin/utils/Strings.sol";
import {ECDSA} from "@openzeppelin/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/utils/cryptography/EIP712.sol";
import {ReentrancyGuard} from "@openzeppelin/utils/ReentrancyGuard.sol";

contract BadgeContract is ERC721, Ownable, EIP712, ReentrancyGuard {
    using Strings for uint256;

    struct BadgeInfo {
        uint8 tier;
        uint256 timestamp;
        uint256 txCount;
    }

    error InvalidTier();
    error InvalidClaimFee();
    error AlreadyClaimed();
    error ThresholdNotMet();
    error InvalidProof();
    error ProofExpired();
    error Soulbound();
    error WithdrawFailed();

    event BadgeClaimed(address indexed owner, uint8 tier, uint256 txCount, uint256 timestamp);
    event Locked(uint256 tokenId);
    event ProofSignerUpdated(address indexed signer);

    uint256 public constant CLAIM_FEE = 0.001 ether;
    uint256 public constant PROOF_VALIDITY = 1 days;
    uint256[4] public THRESHOLDS = [uint256(5), uint256(10), uint256(20), uint256(30)];

    mapping(address => uint8[]) public claimedTiers;
    mapping(address => BadgeInfo[]) public badgeHistory;
    mapping(uint256 => BadgeInfo) public tokenBadgeInfo;

    address public proofSigner;
    uint256 public nextTokenId = 1;

    mapping(address => mapping(uint8 => bool)) private _hasClaimed;

    bytes32 private constant TX_COUNT_PROOF_TYPEHASH =
        keccak256("TxCountProof(address wallet,uint256 txCount,uint256 timestamp,uint8 tier,uint256 chainId,address verifyingContract)");

    string[4] private TIER_NAMES = ["Initiate", "Ascendant", "Ritualist", "Radiant"];
    string[4] private BADGE_IMAGES = [
        "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeibqhzjvvd7o4c23rkv73fsgrlytxp3gzoeqqsnjh34www4wyrkhhe",
        "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeici4m34tnar6fdyk7wzgcr5npf3aypdyojdm7nlsq3qcrxufwclky",
        "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeiho5qjnczxkwwbi2bcojrhujqcw7deydopcqor6e47cmhlkowzxvy",
        "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeiagl2hlqva6cafymndjroy7wzqoehqym6lq5hh53l66tw6reuifya"
    ];

    constructor(address initialOwner, address initialProofSigner)
        ERC721("Enshrined Badge", "ENSHB")
        Ownable(initialOwner)
        EIP712("EnshrinedBadge", "1")
    {
        if (initialProofSigner == address(0)) revert InvalidProof();
        proofSigner = initialProofSigner;
        emit ProofSignerUpdated(initialProofSigner);
    }

    function claimBadge(uint8 tier, bytes calldata infernetProof) external payable nonReentrant {
        if (tier > 3) revert InvalidTier();
        if (msg.value != CLAIM_FEE) revert InvalidClaimFee();
        if (_hasClaimed[msg.sender][tier]) revert AlreadyClaimed();

        (address wallet, uint256 txCount, uint256 timestamp, bytes memory signature) =
            abi.decode(infernetProof, (address, uint256, uint256, bytes));

        if (wallet != msg.sender) revert InvalidProof();
        if (timestamp > block.timestamp || block.timestamp - timestamp > PROOF_VALIDITY) revert ProofExpired();
        if (ECDSA.recover(_proofDigest(wallet, txCount, timestamp, tier), signature) != proofSigner) {
            revert InvalidProof();
        }
        if (txCount < THRESHOLDS[tier]) revert ThresholdNotMet();

        _hasClaimed[msg.sender][tier] = true;
        claimedTiers[msg.sender].push(tier);

        BadgeInfo memory info = BadgeInfo({tier: tier, timestamp: block.timestamp, txCount: txCount});
        badgeHistory[msg.sender].push(info);

        uint256 tokenId = nextTokenId++;
        tokenBadgeInfo[tokenId] = info;
        _forwardFee(msg.value);
        _safeMint(msg.sender, tokenId);

        emit Locked(tokenId);
        emit BadgeClaimed(msg.sender, tier, txCount, block.timestamp);
    }

    function hasClaimed(address wallet, uint8 tier) public view returns (bool) {
        if (tier > 3) return false;
        return _hasClaimed[wallet][tier];
    }

    function getClaimedTiers(address wallet) external view returns (uint8[] memory) {
        return claimedTiers[wallet];
    }

    function setProofSigner(address newProofSigner) external onlyOwner {
        if (newProofSigner == address(0)) revert InvalidProof();
        proofSigner = newProofSigner;
        emit ProofSignerUpdated(newProofSigner);
    }

    function locked(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "missing token");
        return true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "missing token");
        BadgeInfo memory info = tokenBadgeInfo[tokenId];
        string memory tierName = TIER_NAMES[info.tier];
        address holder = ownerOf(tokenId);

        bytes memory json = abi.encodePacked(
            '{"name":"Enshrined ',
            tierName,
            ' Badge #',
            tokenId.toString(),
            '","description":"Soulbound Enshrined badge earned on Ritual Chain.",',
            '"image":"',
            BADGE_IMAGES[info.tier],
            '","attributes":[',
            '{"trait_type":"Tier","value":"',
            tierName,
            '"},{"trait_type":"Tx Count","value":',
            info.txCount.toString(),
            '},{"trait_type":"Owner","value":"',
            Strings.toHexString(uint160(holder), 20),
            '"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(json));
    }

    function proofDigest(address wallet, uint256 txCount, uint256 timestamp, uint8 tier) external view returns (bytes32) {
        return _proofDigest(wallet, txCount, timestamp, tier);
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        if (!ok) revert WithdrawFailed();
    }

    function _forwardFee(uint256 amount) internal {
        (bool ok,) = owner().call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }

    function approve(address, uint256) public pure override {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert Soulbound();
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function _proofDigest(address wallet, uint256 txCount, uint256 timestamp, uint8 tier) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(TX_COUNT_PROOF_TYPEHASH, wallet, txCount, timestamp, tier, block.chainid, address(this)))
        );
    }
}
