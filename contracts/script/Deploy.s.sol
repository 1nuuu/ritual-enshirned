// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BadgeContract} from "../src/BadgeContract.sol";
import {GachaContract} from "../src/GachaContract.sol";
import {CardNFT} from "../src/CardNFT.sol";
import {EnshrionedConsumer} from "../src/EnshrionedConsumer.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address owner = vm.envOr("OWNER_WALLET", deployer);
        address proofSigner = vm.envOr("PROOF_SIGNER", deployer);

        console.log("Deployer:", deployer);
        console.log("Owner:", owner);
        console.log("Proof signer:", proofSigner);

        vm.startBroadcast(deployerPrivateKey);

        BadgeContract badge = new BadgeContract(owner, proofSigner);
        GachaContract gacha = new GachaContract(owner, address(badge));
        CardNFT card = new CardNFT(owner, address(gacha));
        EnshrionedConsumer consumer = new EnshrionedConsumer(owner, address(badge), proofSigner);

        if (owner == deployer) {
            gacha.setCardNFT(address(card));
        }

        vm.stopBroadcast();

        console.log("---");
        console.log("BadgeContract:", address(badge));
        console.log("GachaContract:", address(gacha));
        console.log("CardNFT:", address(card));
        console.log("EnshrionedConsumer:", address(consumer));

        if (owner != deployer) {
            console.log("WARNING: owner != deployer");
            console.log("You must call gacha.setCardNFT(cardAddress) from owner wallet");
            console.log("GachaContract needs CardNFT address set before minting works");
        }
    }
}
