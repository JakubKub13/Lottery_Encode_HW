//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {InfinitumToken} from "./InfinitumToken.sol";

contract Lottery is Ownable {
    InfinitumToken public paymentToken;
    uint256 public closingTime;
    bool public betsOpen;
    uint256 public betPrice;
    uint256 public betFee;

    constructor(string memory tokenName, string memory tokenSymbol, uint256 _betPrice, uint256 _betFee) {
        paymentToken = new InfinitumToken(tokenName, tokenSymbol);
        betPrice = _betPrice;
        betFee = _betFee;
    }

    modifier whenBetsClosed() {
        require(!betsOpen, "Lottery: Bets are not closed");
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
        paymentToken.mint(msg.sender, msg.value);
    }

}