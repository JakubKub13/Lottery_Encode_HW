import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import { Lottery, LotteryToken } from "../typechain-types";
dotenv.config();

async function main() {
    let lottery: Lottery;
    let token: LotteryToken;

    const BET_PRICE = 0.01;
    const BET_FEE = 0.002;

    const lotteryFactory = await ethers.getContractFactory("Lottery");
    lottery = await lotteryFactory.deploy(
        "LotteryToken",
        "LT0",
        ethers.utils.parseEther(BET_PRICE.toFixed(18)),
        ethers.utils.parseEther(BET_FEE.toFixed(18))
    );
    await lottery.deployed();
    console.log(`Lottery contract deployed at address ${lottery.address}`);
    const tokenAddress = await lottery.paymentToken();
    const tokenFactory = await ethers.getContractFactory("LotteryToken")
    token = tokenFactory.attach(tokenAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });