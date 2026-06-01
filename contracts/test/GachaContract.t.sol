// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BadgeContract} from "../src/BadgeContract.sol";
import {GachaContract} from "../src/GachaContract.sol";

contract GachaContractTest is Test {
    uint256 internal constant CLAIM_FEE = 0.001 ether;

    BadgeContract internal badge;
    GachaContract internal gacha;
    uint256 internal signerKey = 0xA11CE;
    address internal signer;
    address internal owner = address(this);
    address internal user = address(0xCAFE);

    receive() external payable {}

    function setUp() public {
        signer = vm.addr(signerKey);
        badge = new BadgeContract(owner, signer);
        gacha = new GachaContract(owner, address(badge));
        vm.deal(user, 1 ether);
    }

    function test_RarityDistributionBoundaries() public view {
        assertEq(gacha.rarityForRoll(0, 0), 0);
        assertEq(gacha.rarityForRoll(0, 94), 0);
        assertEq(gacha.rarityForRoll(0, 95), 1);
        assertEq(gacha.rarityForRoll(1, 0), 1);
        assertEq(gacha.rarityForRoll(1, 89), 1);
        assertEq(gacha.rarityForRoll(1, 90), 2);
        assertEq(gacha.rarityForRoll(2, 0), 2);
        assertEq(gacha.rarityForRoll(2, 96), 2);
        assertEq(gacha.rarityForRoll(2, 97), 3);
        assertEq(gacha.rarityForRoll(3, 14), 2);
        assertEq(gacha.rarityForRoll(3, 15), 3);
    }

    function test_RequestPull_RequiresBadge() public {
        vm.prank(user);
        vm.expectRevert(GachaContract.BadgeRequired.selector);
        gacha.requestPull(0);
    }

    function test_RequestPull_SetsPendingRarity() public {
        _claim(user, 0, 7);

        vm.prank(user);
        gacha.requestPull(0);

        (uint8 rarity, uint8 cardIndex, bool exists) = gacha.pendingPull(user);
        assertTrue(exists);
        assertTrue(gacha.hasPendingPull(user));
        assertLe(rarity, 1);
        assertLt(cardIndex, rarity == 0 ? 3 : 4);
    }

    function test_ConsumePull_OnlyCardNFT() public {
        _claim(user, 0, 7);
        vm.prank(user);
        gacha.requestPull(0);

        vm.expectRevert(GachaContract.UnauthorizedCardNFT.selector);
        gacha.consumePull(user);

        gacha.setCardNFT(address(this));
        gacha.consumePull(user);
        assertFalse(gacha.hasPendingPull(user));
        (,, bool exists) = gacha.pendingPull(user);
        assertFalse(exists);
    }

    function _claim(address wallet, uint8 tier, uint256 txCount) internal {
        bytes32 digest = badge.proofDigest(wallet, txCount, block.timestamp, tier);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        bytes memory proof = abi.encode(wallet, txCount, block.timestamp, abi.encodePacked(r, s, v));

        vm.prank(wallet);
        badge.claimBadge{value: CLAIM_FEE}(tier, proof);
    }
}
