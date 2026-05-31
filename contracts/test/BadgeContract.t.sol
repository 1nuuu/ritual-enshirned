// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BadgeContract} from "../src/BadgeContract.sol";

contract BadgeContractTest is Test {
    uint256 internal constant CLAIM_FEE = 0.005 ether;

    BadgeContract internal badge;
    uint256 internal signerKey = 0xA11CE;
    address internal signer;
    address internal owner = address(0xBEEF);
    address internal user = address(0xCAFE);

    function setUp() public {
        signer = vm.addr(signerKey);
        badge = new BadgeContract(owner, signer);
        vm.deal(user, 1 ether);
    }

    function test_ClaimBadge_MintsSoulboundBadge() public {
        bytes memory proof = _proof(user, 7, 0, block.timestamp);
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(user);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);

        assertTrue(badge.hasClaimed(user, 0));
        assertEq(badge.ownerOf(1), user);
        assertTrue(badge.locked(1));
        assertEq(owner.balance, ownerBalanceBefore + CLAIM_FEE);
    }

    function test_ClaimBadge_RevertsBelowThreshold() public {
        bytes memory proof = _proof(user, 4, 0, block.timestamp);

        vm.prank(user);
        vm.expectRevert(BadgeContract.ThresholdNotMet.selector);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);
    }

    function test_ClaimBadge_RevertsDuplicateTier() public {
        bytes memory proof = _proof(user, 7, 0, block.timestamp);

        vm.startPrank(user);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);
        vm.expectRevert(BadgeContract.AlreadyClaimed.selector);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);
        vm.stopPrank();
    }

    function test_ClaimBadge_RevertsBadSigner() public {
        bytes32 digest = badge.proofDigest(user, 7, block.timestamp, 0);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBAD, digest);
        bytes memory proof = abi.encode(user, uint256(7), block.timestamp, abi.encodePacked(r, s, v));

        vm.prank(user);
        vm.expectRevert(BadgeContract.InvalidProof.selector);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);
    }

    function test_SoulboundTransferReverts() public {
        bytes memory proof = _proof(user, 7, 0, block.timestamp);

        vm.prank(user);
        badge.claimBadge{value: CLAIM_FEE}(0, proof);

        vm.prank(user);
        vm.expectRevert(BadgeContract.Soulbound.selector);
        badge.transferFrom(user, address(0xD00D), 1);
    }

    function _proof(address wallet, uint256 txCount, uint8 tier, uint256 timestamp) internal view returns (bytes memory) {
        bytes32 digest = badge.proofDigest(wallet, txCount, timestamp, tier);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        return abi.encode(wallet, txCount, timestamp, abi.encodePacked(r, s, v));
    }
}
