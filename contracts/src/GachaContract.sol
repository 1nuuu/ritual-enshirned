// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/access/Ownable.sol";

interface IBadgeContract {
    function hasClaimed(address wallet, uint8 tier) external view returns (bool);
}

contract GachaContract is Ownable {
    uint8 public constant COMMON_COUNT = 3;
    uint8 public constant RARE_COUNT = 4;
    uint8 public constant EPIC_COUNT = 5;
    uint8 public constant LEGENDARY_COUNT = 6;

    struct PendingPull {
        uint8 rarity;
        uint8 cardIndex;
        bool exists;
    }

    error InvalidTier();
    error BadgeRequired();
    error PendingPullExists();
    error NoPendingPull();
    error UnauthorizedCardNFT();
    error InvalidCardNFT();

    event CardNFTUpdated(address indexed cardNFT);
    event GachaResult(address indexed owner, uint8 tier, uint8 rarity, uint8 cardIndex, uint256 timestamp);

    IBadgeContract public immutable badgeContract;
    address public cardNFT;
    uint256 public totalPulls;

    mapping(address => PendingPull) public pendingPull;

    constructor(address initialOwner, address badgeContractAddress) Ownable(initialOwner) {
        if (badgeContractAddress == address(0)) revert BadgeRequired();
        badgeContract = IBadgeContract(badgeContractAddress);
    }

    function setCardNFT(address newCardNFT) external onlyOwner {
        if (newCardNFT == address(0)) revert InvalidCardNFT();
        cardNFT = newCardNFT;
        emit CardNFTUpdated(newCardNFT);
    }

    function requestPull(uint8 tier) external {
        if (tier > 3) revert InvalidTier();
        if (!badgeContract.hasClaimed(msg.sender, tier)) revert BadgeRequired();
        if (pendingPull[msg.sender].exists) revert PendingPullExists();

        uint256 seed = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, block.number, msg.sender, totalPulls))
        );
        uint8 rarity = rarityForRoll(tier, seed % 100);
        uint8 cardCount = cardCountForRarity(rarity);
        uint8 cardIndex = uint8(
            uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, uint256(1)))) % cardCount
        );

        pendingPull[msg.sender] = PendingPull({rarity: rarity, cardIndex: cardIndex, exists: true});
        totalPulls++;

        emit GachaResult(msg.sender, tier, rarity, cardIndex, block.timestamp);
    }

    function consumePull(address wallet) external {
        if (msg.sender != cardNFT) revert UnauthorizedCardNFT();
        if (!pendingPull[wallet].exists) revert NoPendingPull();

        delete pendingPull[wallet];
    }

    function hasPendingPull(address wallet) external view returns (bool) {
        return pendingPull[wallet].exists;
    }

    function cardCountForRarity(uint8 rarity) internal pure returns (uint8) {
        if (rarity == 0) return COMMON_COUNT;
        if (rarity == 1) return RARE_COUNT;
        if (rarity == 2) return EPIC_COUNT;
        return LEGENDARY_COUNT;
    }

    function rarityForRoll(uint8 tier, uint256 roll) public pure returns (uint8) {
        if (tier > 3) revert InvalidTier();
        uint256 r = roll % 100;

        if (tier == 0) {
            return r < 70 ? 0 : 1;
        }
        if (tier == 1) {
            if (r < 40) return 0;
            if (r < 85) return 1;
            return 2;
        }
        if (tier == 2) {
            if (r < 40) return 1;
            if (r < 85) return 2;
            return 3;
        }
        return r < 30 ? 2 : 3;
    }
}
