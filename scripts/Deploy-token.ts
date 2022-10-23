import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();
import { developmentChains } from "../helper-hardhat-config";
import { LotteryToken } from "../typechain-types";
import { verify } from "../verify";

async function main() {
    let lotteryToken: LotteryToken;

    const [deployer] = await ethers.getSigners();
    const lotteryTokenFactory = await ethers.getContractFactory("LotteryToken");
    lotteryToken = await lotteryTokenFactory.deploy("Lottery Token", "LTO");
    await lotteryToken.deployed();
    console.log(`Lottery token contract was deployed at the address of ${lotteryToken.address}`);
    const args: any[] = ["LotteryToken", "LTO"]

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying.........")
        await verify(lotteryToken.address, args);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});