//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LotteryToken} from "./LotteryToken.sol";

contract Lottery is Ownable {
    LotteryToken public paymentToken;
    uint256 public closingTime;
    bool public betsOpen;
    uint256 public betPrice;
    uint256 public betFee;

    ///@notice Amount of tokens in the prize pool
    uint256 public prizePool;

    ///@notice Amount of tokens in the owner pool
    uint256 public ownerPool;

    ///@notice Mapping of the prize availabel for withdraw for each account
    mapping(address => uint256) public prize;

    ///@dev List of bet slots
    address[] _slots;

    constructor(string memory tokenName, string memory tokenSymbol, uint256 _betPrice, uint256 _betFee) {
        paymentToken = new LotteryToken(tokenName, tokenSymbol);
        betPrice = _betPrice;
        betFee = _betFee;
    }

    modifier whenBetsClosed() {
        require(!betsOpen, "Lottery: Bets are open");
        _;
    }

    modifier whenBetsOpen() {
        require(betsOpen && block.timestamp < closingTime, "Lottery: Bets are closed");
        _;
    }

    /// @param _closingTime target time in seconds expressed in epoch time for the bets to close
    function openBets(uint256 _closingTime) public onlyOwner {
        require(_closingTime > block.timestamp, "Lottery: Closing time must be in the future");
        closingTime = _closingTime;
        betsOpen = true;
    }

    /// @notice Give tokens based on the amount of ETH sent
    function purchaseTokens() public payable {
        paymentToken.mint(msg.sender, msg.value * 100);
    }

    function bet() public whenBetsOpen {
        ownerPool += betFee;
        prizePool += betPrice;
        _slots.push(msg.sender);
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
    }

    /// @notice Close the lottery and claculates  the price if any,
    /// @dev Anyone can call this function if the owenr fails to do so
    function  closeLottery() public {
        require(block.timestamp >= closingTime, "Lottery: Can not close lottery yer");
        require(betsOpen, "Lottery: Already closed");
        if(_slots.length > 0) {
            uint256 winnerIndex = getRandomNumber() % _slots.length;
            address winner = _slots[winnerIndex];
            prize[winner] += prizePool;
            prizePool = 0;
            delete (_slots);
        }
    }

    /// @notice Get a random number calculated from the previous block randao
    /// @dev This only works after the Merg/// @notice Explain to an end user what this does
   function getRandomNumber() public view returns (uint256 randomNumber) {
    randomNumber = block.difficulty;
   }
}