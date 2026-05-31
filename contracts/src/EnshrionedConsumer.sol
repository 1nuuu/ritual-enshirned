// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/utils/cryptography/ECDSA.sol";
import {BadgeContract} from "./BadgeContract.sol";

contract EnshrionedConsumer is Ownable {
    error InvalidProof();
    error InvalidConfig();

    event BadgeContractUpdated(address indexed badgeContract);
    event ProofSignerUpdated(address indexed proofSigner);
    event TxCountProofVerified(address indexed wallet, uint8 tier, uint256 txCount, uint256 timestamp);

    string public constant JOB_TYPE = "verify-txcount";

    BadgeContract public badgeContract;
    address public proofSigner;

    constructor(address initialOwner, address badgeContractAddress, address initialProofSigner) Ownable(initialOwner) {
        if (badgeContractAddress == address(0) || initialProofSigner == address(0)) revert InvalidConfig();
        badgeContract = BadgeContract(badgeContractAddress);
        proofSigner = initialProofSigner;
        emit BadgeContractUpdated(badgeContractAddress);
        emit ProofSignerUpdated(initialProofSigner);
    }

    function setBadgeContract(address newBadgeContract) external onlyOwner {
        if (newBadgeContract == address(0)) revert InvalidConfig();
        badgeContract = BadgeContract(newBadgeContract);
        emit BadgeContractUpdated(newBadgeContract);
    }

    function setProofSigner(address newProofSigner) external onlyOwner {
        if (newProofSigner == address(0)) revert InvalidConfig();
        proofSigner = newProofSigner;
        emit ProofSignerUpdated(newProofSigner);
    }

    function verifyTxCountProof(uint8 tier, bytes calldata proof)
        external
        returns (address wallet, uint256 txCount, uint256 timestamp)
    {
        bytes memory signature;
        (wallet, txCount, timestamp, signature) = abi.decode(proof, (address, uint256, uint256, bytes));
        bytes32 digest = badgeContract.proofDigest(wallet, txCount, timestamp, tier);
        if (ECDSA.recover(digest, signature) != proofSigner) revert InvalidProof();

        emit TxCountProofVerified(wallet, tier, txCount, timestamp);
    }
}
