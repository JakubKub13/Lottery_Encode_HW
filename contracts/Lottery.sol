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
    uint256 public baseFeeToWithdrawPrize;
    uint256 private winningPrizeToTransfer;

    address[] public lotteryPlayers;
    address public latestLotteryWinner;

    bool public betsOpen;

    mapping(address => uint256) public winningPrize;
    mapping(address => bool) public lotteryMembers;
    mapping(address => uint256) public latestBurntAmount;
    mapping(address => uint256) private burntAmountToTransfer;

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
        paymentToken.mint(msg.sender, msg.value);
    }

    function bet() public whenBetsOpen {
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    ///@notice Calls the bet function times times
    function betMany(uint256 times) public {
        require(times > 0);
        while (times > 0) {
            bet();
            times--;
        }
    }

    /// @notice Close the lottery and claculates  the price if any,
    /// @dev Anyone can call this function if the owenr fails to do so
    function  closeLottery() public {
        require(block.timestamp >= closingTime, "Lottery: Can not close lottery yet");
        require(betsOpen, "Lottery: Already closed");
        if(_slots.length > 0) {
            uint256 winnerIndex = getRandomNumber() % _slots.length;
            address winner = _slots[winnerIndex];
            prize[winner] += prizePool;
            prizePool = 0;
            delete (_slots);
        }
        betsOpen = false;
    }

    /// @notice Get a random number calculated from the previous block randao
    /// @dev This only works after the Merg/// @notice Explain to an end user what this does
   function getRandomNumber() public view returns (uint256 randomNumber) {
    randomNumber = block.difficulty;
   }

   ///@notice Withdraw amount from that account prize pool
   function prizeWithdraw(uint256 amount) public {
    require(amount <= prize[msg.sender], "Lottery: Not enought prize");
    prize[msg.sender] -= amount;
    paymentToken.transfer(msg.sender, amount);
   }

   ///@notice Withdraw amount from the owner pool
   function ownerWithdraw(uint256 amount) public onlyOwner {
    require(amount <= ownerPool, "Lottery: Not enough fees collected");
    ownerPool -= amount;
    paymentToken.transfer(msg.sender, amount);
   }

   ///@notice Burn amount tokens and give the equivalent ETH back to user
   function returnTokens(uint256 amount) public {
    paymentToken.burnFrom(msg.sender, amount);
    payable(msg.sender).transfer(amount);
   }

   fallback() external payable {
    paymentToken.mint(msg.sender, msg.value);
   }
}