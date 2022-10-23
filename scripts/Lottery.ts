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
                console.log(`this is the ${prize}`)
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
    const balanceOfToken = token.balanceOf(accounts[Number(index)].address);
    await token.connect(accounts[Number(index)]).approve(lottery.address, balanceOfToken)
    const tx = await lottery.connect(accounts[Number(index)]).bet();
    const receipt = await tx.wait();
    console.log(`The account of address ${accounts[Number(index)].address} has betted ${receipt.transactionHash}`);
  }
  
  async function closeLottery() {
    const tx = await lottery.closeLottery();
    const receipt = await tx.wait();
    console.log(`The Lottery was closed the hash of TX is: ${receipt.transactionHash}`);
  }
  
  async function displayPrize(index: string) {
    const prize = await lottery.prize(accounts[Number(index)].address);
    const formattedPrize = ethers.utils.formatEther(prize);
    console.log(`The amount of prize in lottery tokens of address is: ${formattedPrize}`);
    return prize;
  }
  
  async function claimPrize(index: string, amount: string) {
    const balanceOfTokensBef = await token.balanceOf(accounts[Number(index)].address);
    const balanceBefFormatted = ethers.utils.formatEther(balanceOfTokensBef)
    const tx = await lottery.connect(accounts[Number(index)]).prizeWithdraw(amount);
    const receipt = await tx.wait();
    const balanceOfTokensAft = await token.balanceOf(accounts[Number(index)].address);
    const balanceAftFormatted = ethers.utils.formatEther(balanceOfTokensAft);
    console.log(`Balance of this address before was: ${balanceBefFormatted} TX hash is ${receipt.transactionHash}`);
    console.log(`Balance of this address after withdraw is ${balanceAftFormatted} TX hash is ${receipt.transactionHash}`);
  }
  
  async function displayOwnerPool() {
    const ownerPool = await lottery.ownerPool();
    const ownerPoolFormatted = ethers.utils.formatEther(ownerPool);
    console.log(ownerPoolFormatted);
  }
  
  async function withdrawTokens(amount: string) {
    const parsedAmount = ethers.utils.parseEther(amount)
    const tx = await lottery.ownerWithdraw(parsedAmount);
    const receipt = await tx.wait();
    const balanceOfOwnerAft = await token.balanceOf(accounts[0].address);
    const balanceOfOwnerAftFormatted = ethers.utils.formatEther(balanceOfOwnerAft);
    console.log(`Balance of Owner address after withdraw is: ${balanceOfOwnerAftFormatted} TX has is ${receipt.transactionHash}`);
  }
  
  async function burnTokens(index: string, amount: string) {
    const parsedAmount = ethers.utils.parseEther(amount);
    await token.connect(accounts[Number(index)]).approve(lottery.address, parsedAmount);
    const tx = await lottery.connect(accounts[Number(index)]).returnTokens(parsedAmount);
    const receipt = await tx.wait();
    await displayBalance(index);
    console.log(`TX hash is : ${receipt.transactionHash}`);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });