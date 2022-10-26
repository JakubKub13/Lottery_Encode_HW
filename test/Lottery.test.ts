import { expect} from "chai";
import { ethers, network } from "hardhat";
import { Lottery, LotteryToken } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";



const TOKEN_NAME: string = "Lottery Token";
const TOKEN_SYMBOL: string = "Lt0";
const BET_PRICE = 0.1;
const BET_FEE = 0.02;
const CLOSING_TIME = 50;


describe("Lottery", function() {
    let lottery: Lottery;
    let lotteryToken: LotteryToken;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let account3: SignerWithAddress;
    let nonLotteryMem: SignerWithAddress;

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
        [owner, account1, account2, account3, nonLotteryMem] = await ethers.getSigners();
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
        await expect(lottery.connect(account1).bet()).to.be.revertedWith("Lottery: Bets are closed")
    });

    it("Only owner can open the bets", async() => {
        const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
        const closingTime = currentTime + CLOSING_TIME;
        await expect(lottery.connect(account1).openBets(closingTime)).to.be.revertedWith("Ownable: caller is not the owner")    //revertedWith("Ownable: caller is not the owner")
    });

    it("Only owner can open the bets2", async () => {
        const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
        const closingTime = currentTime + CLOSING_TIME;
        await expect(lottery.openBets(closingTime)).to.emit(lottery, "OpenBets")
    });

    it("Should revert when lottery is not open", async () => {
        await expect(lottery.connect(account1).bet()).to.be.revertedWith("Lottery: Bets are closed")
    });

    it("Players should place bets when lottery is opened", async () => {
        const amountToBuy = ethers.utils.parseUnits("2", "ether");
        const tx = await lottery.connect(account1).purchaseTokens({ value: amountToBuy });
        const tx2 = await lottery.connect(account2).purchaseTokens({ value: amountToBuy });
        const tx3 = await lottery.connect(account3).purchaseTokens({ value: amountToBuy });
        await tx.wait();
        await tx2.wait();
        await tx3.wait();
        const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
        const closingTime = currentTime + CLOSING_TIME;
        const amountToApprove = await lotteryToken.balanceOf(account1.address);
        const apprTx1 = await lotteryToken.connect(account1).approve(lottery.address, amountToApprove);
        const apprTx2 = await lotteryToken.connect(account2).approve(lottery.address, amountToApprove);
        const apprTx3 = await lotteryToken.connect(account3).approve(lottery.address, amountToApprove);
        await apprTx1.wait();
        await apprTx2.wait();
        await apprTx3.wait();
        const openTx = await lottery.openBets(closingTime);
        await openTx.wait();
        await expect(lottery.connect(account1).bet()).to.emit(lottery, "Betted");
        await expect(lottery.connect(account2).bet()).to.emit(lottery, "Betted");
        await expect(lottery.connect(account3).bet()).to.emit(lottery, "Betted");
    });

    it("Should push player address to array of lotteryPlayers", async () => {
        const amountToBuy = ethers.utils.parseUnits("2", "ether");
        const tx = await lottery.connect(account1).purchaseTokens({ value: amountToBuy });
        const tx2 = await lottery.connect(account2).purchaseTokens({ value: amountToBuy });
        const tx3 = await lottery.connect(account3).purchaseTokens({ value: amountToBuy });
        await tx.wait();
        await tx2.wait();
        await tx3.wait();
        const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
        const closingTime = currentTime + CLOSING_TIME;
        const amountToApprove = await lotteryToken.balanceOf(account1.address);
        const apprTx1 = await lotteryToken.connect(account1).approve(lottery.address, amountToApprove);
        const apprTx2 = await lotteryToken.connect(account2).approve(lottery.address, amountToApprove);
        const apprTx3 = await lotteryToken.connect(account3).approve(lottery.address, amountToApprove);
        await apprTx1.wait();
        await apprTx2.wait();
        await apprTx3.wait();
        const openTx = await lottery.openBets(closingTime);
        await openTx.wait();
        const betTx1 = await lottery.connect(account1).bet();
        const betTx2 = await lottery.connect(account2).bet();
        const betTx3 = await lottery.connect(account3).bet();
        await betTx1.wait();
        await betTx2.wait();
        await betTx3.wait();
        const addr1 = await lottery.lotteryPlayers(0);
        const addr2 = await lottery.lotteryPlayers(1);
        const addr3 = await lottery.lotteryPlayers(2);
        expect(addr1).to.eq(account1.address);
        expect(addr2).to.eq(account2.address);
        expect(addr3).to.eq(account3.address);
    });

    describe("Lottery closing", function () {
        beforeEach(async () => {
            const amountToBuy = ethers.utils.parseUnits("2", "ether");
            const tx = await lottery.connect(account1).purchaseTokens({ value: amountToBuy });
            const tx2 = await lottery.connect(account2).purchaseTokens({ value: amountToBuy });
            const tx3 = await lottery.connect(account3).purchaseTokens({ value: amountToBuy });
            await tx.wait();
            await tx2.wait();
            await tx3.wait();
            const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
            const closingTime = currentTime + CLOSING_TIME;
            const amountToApprove = await lotteryToken.balanceOf(account1.address);
            const apprTx1 = await lotteryToken.connect(account1).approve(lottery.address, amountToApprove);
            const apprTx2 = await lotteryToken.connect(account2).approve(lottery.address, amountToApprove);
            const apprTx3 = await lotteryToken.connect(account3).approve(lottery.address, amountToApprove);
            await apprTx1.wait();
            await apprTx2.wait();
            await apprTx3.wait();
            const openTx = await lottery.openBets(closingTime);
            await openTx.wait();
        });

        it("Lottery can not be closed before time has passed", async () => {
            await expect(lottery.closeLottery()).to.be.revertedWith("Lottery: Can not be closed yet !");
        });

        it("Lottery can not be closed by non Lottery member", async () => {
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            await expect(lottery.connect(nonLotteryMem).closeLottery()).to.be.revertedWith("Lottery: Account is not Player or Owner")
        });

        it("Lottery can be closed by any Lottery member after time has passed", async () => {
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            await expect(lottery.connect(account2).closeLottery()).to.emit(lottery, "CloseLottery");
        });

        it("Should calculate the latest Lottery winner", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const winner = await lottery.latestLotteryWinner();
            console.log(`Address of lottery winner is: ${winner}`)
        });

        it("Should update the winning price for address of winner", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const winner = await lottery.latestLotteryWinner();
            const winnerPrize = await lottery.winningPrize(winner);
            const formattedPrize = ethers.utils.formatEther(winnerPrize);
            expect(formattedPrize).to.eq("0.300000000000000018")
        });
        
        it("Should reset lottery cash pool", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const cashPoolAfter = await lottery.lotteryCashPool();
            expect(cashPoolAfter).to.eq(0);
        });

        it("Only owner can withdraw fees from lotteryFeePool", async() => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const feeWithdraw = await lottery.lotteryFeePool();
            await expect(lottery.connect(account2).ownerWithdrawFees(feeWithdraw)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(lottery.ownerWithdrawFees(feeWithdraw)).to.emit(lottery, "FeeWithdraw");
        });

        it("Lottery can be opened again", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
            const closingTime = currentTime + CLOSING_TIME;
            await expect(lottery.openBets(closingTime)).to.emit(lottery, "OpenBets");
        });
   
        it("Winner should withdraw Lottery tokens from contract and it should reset winningPrice", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const winner = await lottery.latestLotteryWinner();
            const prize = await lottery.winningPrize(winner);
            expect(winner).to.eq(account1.address);
            const prizeWthTx = await lottery.connect(account1).prizeWithdraw(prize);
            await prizeWthTx.wait();
            const prizeAft = await lottery.winningPrize(winner);
            expect(prizeAft).to.eq(0);
        });

        it("Owner can burn tokens and get ETH back", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const feePoolAmBf = await lottery.lotteryFeePool();
            expect(ethers.utils.formatEther(feePoolAmBf)).to.eq("0.06");
            const feeWithdrawTx = await lottery.ownerWithdrawFees(feePoolAmBf);
            await feeWithdrawTx.wait();
            const feePoolAmAf = await lottery.lotteryFeePool();
            expect(ethers.utils.formatEther(feePoolAmAf)).to.eq("0.0");
            const balanceOfLT0Owner = await lotteryToken.balanceOf(owner.address);
            const balanceOfETHOwner = await ethers.provider.getBalance(owner.address);
            const apprTx = await lotteryToken.connect(owner).approve(lottery.address, balanceOfLT0Owner);
            await apprTx.wait();
            const returnTx = await lottery.returnTokens(balanceOfLT0Owner);
            await returnTx.wait();
            const balanceOfLT0OwnerAf = await lotteryToken.balanceOf(owner.address);
            const balanceOfETHOwnerAf = await ethers.provider.getBalance(owner.address);
            expect(Number(ethers.utils.formatEther(balanceOfLT0Owner))).to.be.greaterThan(Number(ethers.utils.formatEther(balanceOfLT0OwnerAf)));
            expect(Number(ethers.utils.formatEther(balanceOfETHOwner))).to.be.lessThan(Number(ethers.utils.formatEther(balanceOfETHOwnerAf)));
        });

        it("Winner can burn tokens and get back ETH", async () => {
            const betTx1 = await lottery.connect(account1).bet();
            const betTx2 = await lottery.connect(account2).bet();
            const betTx3 = await lottery.connect(account3).bet();
            await betTx1.wait();
            await betTx2.wait();
            await betTx3.wait();
            await network.provider.send("evm_increaseTime", [360]);
            await network.provider.send("evm_mine");
            const clsTx = await lottery.closeLottery();
            await clsTx.wait();
            const winner = await lottery.latestLotteryWinner();
            const prize = await lottery.winningPrize(winner);
            expect(winner).to.eq(account1.address);
            const balanceOfLT0Winner = await lotteryToken.balanceOf(account1.address);
            const balanceOfETHWinner = await ethers.provider.getBalance(account1.address);
            const apprTx = await lotteryToken.approve(lottery.address, prize);
            await apprTx.wait();
            const returnTx = await lottery.connect(account1).returnTokens(prize);
            await returnTx.wait();
            const balanceOfLT0WinnerAf = await lotteryToken.balanceOf(account1.address);
            const balanceOfETHWinnerAf = await ethers.provider.getBalance(account1.address);
            expect(Number(ethers.utils.formatEther(balanceOfLT0Winner))).to.be.greaterThan(Number(ethers.utils.formatEther(balanceOfLT0WinnerAf)));
            expect(Number(ethers.utils.formatEther(balanceOfETHWinner))).to.be.lessThan(Number(ethers.utils.formatEther(balanceOfETHWinnerAf)));
        });
    });
});
  