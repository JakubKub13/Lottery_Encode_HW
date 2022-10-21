import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import * as readline from "readline";
import { InfinitumToken, Lottery } from "../typechain-types/contracts";

let lottery: Lottery;
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

async function initContracts() {
    const lotteryFactory = await ethers.getContractFactory("Lottery");
    lottery = await lotteryFactory.deploy(
        "LotteryToken",
        "LT0",
        ethers.utils.parseEther(BET_PRICE.toFixed(18)),
        ethers.utils.parseEther(BET_FEE.toFixed(18))
    );
    await lottery.deployed();
    const tokenAddress = await lottery.paymentToken();
    const tokenFactory = await ethers.getContractFactory("LotteryToken")
    token = tokenFactory.attach(tokenAddress);
}

async function initAccounts() {
    accounts = await ethers.getSigners();
}

async function mainMenu(r1: readline.Interface) {
    menuOptions(r1);
}

function menuOptions(rl: readline.Interface) {
    rl.question(
      "Select operation: \n Options: \n [0]: Exit \n [1]: Check state \n [2]: Open bets \n [3]: Top up account tokens \n [4]: Bet with account \n [5]: Close bets \n [6]: Check player prize \n [7]: Withdraw \n [8]: Burn tokens \n",
      async (answer: string) => {
        console.log(`Selected: ${answer}\n`);
        const option = Number(answer);
        switch (option) {
          case 0:
            rl.close();
            return;
          case 1:
            await checkState();
            mainMenu(rl);
            break;
          case 2:
            rl.question("Input duration (in seconds)\n", async (duration) => {
              try {
                await openBets(duration);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
            break;
          case 3:
            rl.question("What account (index) to use?\n", async (index) => {
              await displayBalance(index);
              rl.question("Buy how many tokens?\n", async (amount) => {
                try {
                  await buyTokens(index, amount);
                  await displayBalance(index);
                  await displayTokenBalance(index);
                } catch (error) {
                  console.log("error\n");
                  console.log({ error });
                }
                mainMenu(rl);
              });
            });
            break;
          case 4:
            rl.question("What account (index) to use?\n", async (index) => {
              await displayTokenBalance(index);
              rl.question("Bet how many times?\n", async (amount) => {
                try {
                  await bet(index, amount);
                  await displayTokenBalance(index);
                } catch (error) {
                  console.log("error\n");
                  console.log({ error });
                }
                mainMenu(rl);
              });
            });
            break;
          case 5:
            try {
              await closeLottery();
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
            break;
          case 6:
            rl.question("What account (index) to use?\n", async (index) => {
              const prize = await displayPrize(index);
              if (Number(prize) > 0) {
                rl.question(
                  "Do you want to claim your prize? [Y/N]\n",
                  async (answer) => {
                    if (answer.toLowerCase() === "y") {
                      try {
                        await claimPrize(index, prize);
                      } catch (error) {
                        console.log("error\n");
                        console.log({ error });
                      }
                    }
                    mainMenu(rl);
                  }
                );
              } else {
                mainMenu(rl);
              }
            });
            break;
          case 7:
            await displayTokenBalance("0");
            await displayOwnerPool();
            rl.question("Withdraw how many tokens?\n", async (amount) => {
              try {
                await withdrawTokens(amount);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
            break;
          case 8:
            rl.question("What account (index) to use?\n", async (index) => {
              await displayTokenBalance(index);
              rl.question("Burn how many tokens?\n", async (amount) => {
                try {
                  await burnTokens(index, amount);
                } catch (error) {
                  console.log("error\n");
                  console.log({ error });
                }
                mainMenu(rl);
              });
            });
            break;
          default:
            throw new Error("Invalid option");
        }
      }
    );
  }

  async function checkState() {
    const state = await lottery.betsOpen();
    console.log(`The lottery is ${state ? "open" : "closed"}\n`);
    if (!state) return;
    const currentBlock = await ethers.provider.getBlock("latest");
    const currentBlockDate = new Date(currentBlock.timestamp * 1000);
    const closingTime = await lottery.closingTime();
    const closingTimeDate = new Date(closingTime.toNumber() * 1000);
    console.log(`The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}`);
    console.log(`Lottery should close at ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}`);
  }
  
  async function openBets(duration: string) {
    const currentBlock = await ethers.provider.getBlock("latest");
    const tx = await lottery.openBets(currentBlock.timestamp + Number(duration));
    const receipt = await tx.wait();
    console.log(`Bets opened (${receipt.transactionHash})`);
  }
  
  async function displayBalance(index: string) {
    const balanceBn = await ethers.provider.getBalance(accounts[Number(index)].address);
    const balance = ethers.utils.formatEther(balanceBn);
    console.log(`The account of address ${accounts[Number(index)].address} has ${balance} ETH\n`);
  }
  
  async function buyTokens(index: string, amount: string) {
    const tx = await lottery.connect(accounts[Number(index)]).purchaseTokens({ value: ethers.utils.parseEther(amount), });
    const receipt = await tx.wait();
    console.log(`Tokens bought (${receipt.transactionHash})\n`);
  }
  
  async function displayTokenBalance(index: string) {
    const balanceBn = await token.balanceOf(accounts[Number(index)].address);
    const balance = ethers.utils.formatEther(balanceBn);
    console.log(`The account of address ${accounts[Number(index)].address} has ${balance} Lottery Tokens`);
  }
  
  async function bet(index: string, amount: string) {
    // To do
  }
  
  async function closeLottery() {
    // TODO
  }
  
  async function displayPrize(index: string) {
    // TODO
    return "TODO";
  }
  
  async function claimPrize(index: string, amount: string) {
    // TODO
  }
  
  async function displayOwnerPool() {
    // TODO
  }
  
  async function withdrawTokens(amount: string) {
    // TODO
  }
  
  async function burnTokens(index: string, amount: string) {
    // TODO
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });