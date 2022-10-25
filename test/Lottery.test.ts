import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Lottery, LotteryToken } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";

const TOKEN_NAME: string = "Lottery Token";
const TOKEN_SYMBOL: string = "Lt0";
const BET_PRICE = 0.1;
const BET_FEE = 0.02;


describe("Lottery", function() {
    let lottery: Lottery;
    let lotteryToken: LotteryToken;
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let account3: SignerWithAddress;

    beforeEach(async function() {
        const lotteryFactory = await ethers.getContractFactory("Lottery");
        lottery = await lotteryFactory.deploy(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            ethers.utils.parseEther(BET_PRICE.toFixed(18)),
            ethers.utils.parseEther(BET_FEE.toFixed(18))
        );
        await lottery.deployed();
        const tokenAddress = await lottery.paymentToken();
        const tokenFactory = await ethers.getContractFactory("LotteryToken")
        lotteryToken = tokenFactory.attach(tokenAddress);
        [deployer, account1, account2, account3] = await ethers.getSigners();
    });

    it("Should Deploy without errors", async function() {
        const addressLot = lottery.address;
        const addressToken = await lottery.paymentToken();
        const betPrice = await lottery.betPrice()
        const betFee = await lottery.betFee()
        console.log(ethers.utils.formatEther(betFee));
        console.log(ethers.utils.formatEther(betPrice));
        console.log(addressLot);
        console.log(addressToken);
    });

    it("Should be able to buy Lottery tokens with ETH calling purchaseTokens()", async () => {
        const amountToBuy = ethers.utils.parseUnits("2", "ether");
        const tx = await lottery.connect(account1).purchaseTokens({ value: amountToBuy });
        const tx2 = await lottery.connect(account2).purchaseTokens({ value: amountToBuy });
        const tx3 = await lottery.connect(account3).purchaseTokens({ value: amountToBuy });
        await tx.wait();
        await tx2.wait();
        await tx3.wait();
        const balAddr1 = await lotteryToken.balanceOf(account1.address);
        const balAddr2 = await lotteryToken.balanceOf(account2.address);
        const balAddr3 = await lotteryToken.balanceOf(account3.address);
        expect(balAddr1.toString()).to.eq("2000000000000000000");
        expect(balAddr2.toString()).to.eq("2000000000000000000");
        expect(balAddr3.toString()).to.eq("2000000000000000000");
    });

    it("Should be able to mint Lottery tokens if ETH are send directly without calling purchaseToken()", async () => {
        const amountToBuy = ethers.utils.parseUnits("2", "ether");
        const lotteryAddr = lottery.address;
        let tx = {
            to: lotteryAddr,
            value: amountToBuy
        }
        const txSent1 = await account1.sendTransaction(tx);
        await txSent1.wait();
        const txSent2 = await account2.sendTransaction(tx);
        await txSent2.wait();
        const txSend3 = await account3.sendTransaction(tx);
        await txSend3.wait(); 
        const balAddr1 = await lotteryToken.balanceOf(account1.address);
        const balAddr2 = await lotteryToken.balanceOf(account2.address);
        const balAddr3 = await lotteryToken.balanceOf(account3.address);
        expect(balAddr1.toString()).to.eq("2000000000000000000");
        expect(balAddr2.toString()).to.eq("2000000000000000000");
        expect(balAddr3.toString()).to.eq("2000000000000000000");
    });

    it("Should revert if trying to place a bet before bet is open", async () => {

    });

    it("Only owner can open the bets", async() => {

    });

    it("Should place bets", async () => {

    });

    it("Should close the bets and calculate the winner", async () => {

    });


})