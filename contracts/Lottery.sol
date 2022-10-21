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
        paymentToken.transferFrom(msg.sender, address(this), betPrice + betFee);
        //TO DO give fair chance for this person

    }
}