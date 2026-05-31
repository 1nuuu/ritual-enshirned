// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BadgeContract} from "../src/BadgeContract.sol";
import {GachaContract} from "../src/GachaContract.sol";
import {CardNFT} from "../src/CardNFT.sol";

contract CardNFTTest is Test {
    uint256 internal constant CLAIM_FEE = 0.005 ether;
    uint256 internal constant MINT_FEE = 0.005 ether;

    BadgeContract internal badge;
    GachaContract internal gacha;
    CardNFT internal card;
    uint256 internal signerKey = 0xA11CE;
    address internal signer;
    address internal owner = address(this);
    address internal user = address(0xCAFE);

    receive() external payable {}

    function setUp() public {
        signer = vm.addr(signerKey);
        badge = new BadgeContract(owner, signer);
        gacha = new GachaContract(owner, address(badge));
        card = new CardNFT(owner, address(gacha));
        gacha.setCardNFT(address(card));
        vm.deal(user, 2 ether);
    }

    function test_LoadsAllCards() public view {
        assertEq(card.cardTemplateCount(), 18);
        assertEq(card.rarityPoolSize(0), 3);
        assertEq(card.rarityPoolSize(1), 4);
        assertEq(card.rarityPoolSize(2), 5);
        assertEq(card.rarityPoolSize(3), 6);
    }

    function test_MintCard_ConsumesPendingPull() public {
        _claim(user, 3, 40);

        vm.prank(user);
        gacha.requestPull(3);
        (uint8 rarity, uint8 cardIndex,) = gacha.pendingPull(user);
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(user);
        card.mintCard{value: MINT_FEE}();

        assertEq(card.ownerOf(1), user);
        assertFalse(gacha.hasPendingPull(user));

        (uint8 mintedRarity, uint8 mintedCardIndex, string memory mintedName,, string memory mintedImage, address mintedOwner) =
            card.cardMeta(1);
        assertEq(mintedRarity, rarity);
        assertEq(mintedCardIndex, cardIndex);
        assertTrue(bytes(mintedName).length > 0);
        assertTrue(bytes(mintedImage).length > 0);
        assertEq(mintedOwner, user);
        assertEq(owner.balance, ownerBalanceBefore + MINT_FEE);
    }

    function test_MintCard_RevertsWithoutPendingPull() public {
        vm.prank(user);
        vm.expectRevert(CardNFT.NoPendingPull.selector);
        card.mintCard{value: MINT_FEE}();
    }

    function test_MintCard_RevertsBadFee() public {
        _claim(user, 0, 7);
        vm.prank(user);
        gacha.requestPull(0);

        vm.prank(user);
        vm.expectRevert(CardNFT.InvalidMintFee.selector);
        card.mintCard{value: 1 wei}();
    }

    function _claim(address wallet, uint8 tier, uint256 txCount) internal {
        bytes32 digest = badge.proofDigest(wallet, txCount, block.timestamp, tier);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        bytes memory proof = abi.encode(wallet, txCount, block.timestamp, abi.encodePacked(r, s, v));

        vm.prank(wallet);
        badge.claimBadge{value: CLAIM_FEE}(tier, proof);
    }
}
