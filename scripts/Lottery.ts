import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as readline from "readline";
import { InfinitumToken, Lottery } from "../typechain-types/contracts";

let contract: Lottery;
let token: InfinitumToken;
let accounts: SignerWithAddress[];

const BET_PRICE = 1;
const BET_FEE = 0.2;

async function main() {
    await initContracts();
    await initAccounts();
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    mainMenu(r1);
}

async function initContracts() {}

async function initAccounts() {}

async function mainMenu(r1: readline.Interface) {
    menuOptions(r1);
}

function menuOptions(r1: readline.Interface) {}

async function checkState() {}

async function openBets(duration: string) {}