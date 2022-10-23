import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();
import { developmentChains } from "../helper-hardhat-config";
import { LotteryToken } from "../typechain-types";
import { verify } from "../verify";

async function main() {}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});