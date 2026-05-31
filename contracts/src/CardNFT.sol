// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/utils/ReentrancyGuard.sol";
import {Base64} from "@openzeppelin/utils/Base64.sol";
import {Strings} from "@openzeppelin/utils/Strings.sol";

interface IGachaContract {
    struct PendingPull {
        uint8 rarity;
        uint8 cardIndex;
        bool exists;
    }

    function pendingPull(address wallet) external view returns (PendingPull memory);
    function consumePull(address wallet) external;
}

contract CardNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    struct CardMeta {
        uint8 rarity;
        uint8 cardIndex;
        string name;
        uint256 serial;
        string ipfsImage;
        address owner;
    }

    struct CardTemplate {
        uint8 rarity;
        string name;
        string ipfsImage;
        string lore;
    }

    error InvalidMintFee();
    error NoPendingPull();
    error EmptyRarityPool();
    error WithdrawFailed();

    event CardMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint8 rarity,
        uint8 cardIndex,
        string name,
        uint256 serial,
        string ipfsImage
    );

    uint256 public constant MINT_FEE = 0.005 ether;

    IGachaContract public immutable gachaContract;
    mapping(uint256 => CardMeta) public cardMeta;
    uint256 public totalMinted;

    CardTemplate[] private _cardTemplates;
    mapping(uint8 => uint256[]) private _cardsByRarity;

    constructor(address initialOwner, address gachaContractAddress)
        ERC721("Enshrined Cards", "ENSHC")
        Ownable(initialOwner)
    {
        if (gachaContractAddress == address(0)) revert NoPendingPull();
        gachaContract = IGachaContract(gachaContractAddress);
        _loadCards();
    }

    function mintCard() external payable nonReentrant {
        if (msg.value != MINT_FEE) revert InvalidMintFee();
        IGachaContract.PendingPull memory pull = gachaContract.pendingPull(msg.sender);
        if (!pull.exists) revert NoPendingPull();

        CardTemplate storage template = _getCard(pull.rarity, pull.cardIndex);

        uint256 serial = ++totalMinted;

        cardMeta[serial] = CardMeta({
            rarity: pull.rarity,
            cardIndex: pull.cardIndex,
            name: template.name,
            serial: serial,
            ipfsImage: template.ipfsImage,
            owner: msg.sender
        });

        _safeMint(msg.sender, serial);
        gachaContract.consumePull(msg.sender);

        emit CardMinted(msg.sender, serial, pull.rarity, pull.cardIndex, template.name, serial, template.ipfsImage);

        (bool ok,) = owner().call{value: msg.value}("");
        if (!ok) {}
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "missing token");
        CardMeta memory meta = cardMeta[tokenId];
        string memory rarityNameText = rarityName(meta.rarity);
        string memory ownerHex = Strings.toHexString(uint160(meta.owner), 20);

        bytes memory json = abi.encodePacked(
            '{"name":"',
            meta.name,
            " #",
            meta.serial.toString(),
            '","description":"An Enshrined card pulled and minted on Ritual Chain.",',
            '"image":"',
            meta.ipfsImage,
            '","attributes":[',
            '{"trait_type":"Rarity","value":"',
            rarityNameText,
            '"},{"trait_type":"Card Index","value":',
            uint256(meta.cardIndex).toString(),
            '"},{"trait_type":"Serial","value":',
            meta.serial.toString(),
            '},{"trait_type":"Owner","value":"',
            ownerHex,
            '"}]}'
        );

        return string.concat("data:application/json;base64,", Base64.encode(json));
    }

    function rarityName(uint8 rarity) public pure returns (string memory) {
        if (rarity == 0) return "Common";
        if (rarity == 1) return "Rare";
        if (rarity == 2) return "Epic";
        return "Legendary";
    }

    function cardTemplateCount() external view returns (uint256) {
        return _cardTemplates.length;
    }

    function rarityPoolSize(uint8 rarity) external view returns (uint256) {
        return _cardsByRarity[rarity].length;
    }

    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        if (!ok) revert WithdrawFailed();
    }

    function _getCard(uint8 rarity, uint8 cardIndex) internal view returns (CardTemplate storage) {
        uint256[] storage pool = _cardsByRarity[rarity];
        if (pool.length == 0 || cardIndex >= pool.length) revert EmptyRarityPool();
        return _cardTemplates[pool[cardIndex]];
    }

    function _addCard(uint8 rarity, string memory name, string memory ipfsImage, string memory lore) internal {
        _cardTemplates.push(CardTemplate({rarity: rarity, name: name, ipfsImage: ipfsImage, lore: lore}));
        _cardsByRarity[rarity].push(_cardTemplates.length - 1);
    }

    function _loadCards() internal {
        _addCard(0, "Siggy The Busker", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Busker.png", "SIG-001");
        _addCard(0, "Siggy The Chef", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Cheff.png", "SIG-002");
        _addCard(0, "Siggy The Cadet", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Cadet.png", "SIG-003");

        _addCard(1, "Siggy The Samurai", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Samurai.png", "SIG-004");
        _addCard(1, "Siggy The Hacker", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheHacker.png", "SIG-005");
        _addCard(1, "Siggy The Alchemist", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/Thealchemist.png", "SIG-006");
        _addCard(1, "Siggy The Shadow Knight", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/ShadowKnight.png", "SIG-007");

        _addCard(2, "Siggy The Thunder God", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/ThunderGod.png", "SIG-008");
        _addCard(2, "Siggy The Pharaoh", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/pharoh.png", "SIG-009");
        _addCard(2, "Siggy The Angel Knight", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/AngelKnight.png", "SIG-010");
        _addCard(2, "Siggy The Dragon Rider", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/DragonRider.png", "SIG-011");
        _addCard(2, "Siggy The Void Mage", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/VoidMage.png", "SIG-012");

        _addCard(3, "Siggy The Ritual God", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/God.png", "SIG-013");
        _addCard(3, "Siggy The Time Keeper", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TimeKeeper.png", "SIG-014");
        _addCard(3, "Siggy The Dark Emperor", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/DarkEmperor.png", "SIG-015");
        _addCard(3, "Siggy The Celestial", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheCelestial.png", "SIG-016");
        _addCard(3, "Siggy The Last Guardian", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/TheLastGuardian.png", "SIG-017");
        _addCard(3, "Siggy Prime", "https://aqua-persistent-llama-318.mypinata.cloud/ipfs/bafybeicscbobkhczsnu2n2ghykwfzjfnaccaxx3hj52ypuqf4o23v5tbqu/SiggyPrime.png", "SIG-018");
    }
}
