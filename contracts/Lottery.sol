//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LotteryToken} from "./LotteryToken.sol";

contract Lottery is Ownable {
    LotteryToken public paymentToken;
    ///@notice Amount of tokens in the prize pool
    uint256 public lotteryCashPool;
    ///@notice Amount of tokens in the owner pool
    uint256 public lotteryFeePool;
    uint256 private lotteryFeeToWithdraw;
    uint256 public betPrice;
    uint256 public closingTime;
    uint256 public betFee;
    uint256 private winningPrizeToTransfer;

    address[] public lotteryPlayers;
    address public latestLotteryWinner;

    bool public betsOpen;

    mapping(address => uint256) public winningPrize;
    mapping(address => bool) public lotteryMembers;

    constructor(string memory tokenName, string memory tokenSymbol, uint256 _betPrice, uint256 _betFee) {
        paymentToken = new LotteryToken(tokenName, tokenSymbol);
        betPrice = _betPrice;
        betFee = _betFee;
        lotteryMembers[msg.sender] = true;
    }

    modifier whenBetsClosed() {
        require(!betsOpen, "Lottery: Bets are open");
        _;
    }

    modifier whenBetsOpen() {
        require(betsOpen && block.timestamp < closingTime, "Lottery: Bets are closed");
        _;
    }
   
    modifier lotteryCanBeClosed() {
        require(betsOpen && block.timestamp > closingTime, "Lottery: Can not be closed yet !");
        _;
    }

    modifier isMemberOfLottery() {
        require(lotteryMembers[msg.sender] == true, "Lottery: Account is not Player or Owner");
        _;
    }

    /// @param _closingTime target time in seconds expressed in epoch time for the bets to close
    function openBets(uint256 _closingTime) public onlyOwner whenBetsClosed {
        require(_closingTime > block.timestamp, "Lottery: Closing time must be in the future");
        closingTime = _closingTime;
        betsOpen = true;
    }

    /// @notice Give tokens based on the amount of ETH sent
    function purchaseTokens() public payable {
        lotteryMembers[msg.sender] = true;
        paymentToken.mint(msg.sender, msg.value);
    }

    function bet() public whenBetsOpen {
        require(msg.sender != owner(), "Lottery: Owner of lottery is not authorized to bet");
        lotteryFeePool += betFee;
        lotteryCashPool += betPrice;
        lotteryPlayers.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    /// @notice Close the lottery and claculates  the price if any,
    /// @dev Anyone can call this function if the owenr fails to do so
    function  closeLottery() public lotteryCanBeClosed isMemberOfLottery {
        require(block.timestamp >= closingTime, "Lottery: Can not close lottery yet");
        require(betsOpen, "Lottery: Already closed");
        if(lotteryPlayers.length > 0) {
            uint256 winnerIndex = getRandomNumber() % lotteryPlayers.length;
            address winner = lotteryPlayers[winnerIndex];
            winningPrize[winner] += lotteryCashPool;
            lotteryCashPool = 0;
            delete (lotteryPlayers);
        }
        betsOpen = false;
    }

    /// @notice Get a random number calculated from the previous block randao
    /// @dev This only works after the Merg/// @notice Explain to an end user what this does
   function getRandomNumber() public view returns (uint256 randomNumber) {
    randomNumber = block.difficulty;
   }

   ///@notice Withdraw amount from that account prize pool
   function prizeWithdraw(uint256 amount) public isMemberOfLottery {
    require(amount <= winningPrize[msg.sender], "Lottery: Not enought prize");
    winningPrize[msg.sender] -= amount;
    paymentToken.transfer(msg.sender, amount);
   }

   ///@notice Withdraw amount from the owner pool
   function ownerWithdrawFees(uint256 amount) public onlyOwner {
    require(amount <= lotteryFeePool, "Lottery: Not enough fees collected");
    lotteryFeePool -= amount;
    paymentToken.transfer(msg.sender, amount);
   }

   ///@notice Burn amount tokens and give the equivalent ETH back to user
   function returnTokens(uint256 amount) public {
    paymentToken.burnFrom(msg.sender, amount);
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Lottery: Fails burning tokens and returning Ethers");
    
   }

   fallback() external payable {
    paymentToken.mint(msg.sender, msg.value);
   }

   receive() external payable {}
}