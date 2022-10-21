//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    uint256 public closingTime;
    bool public betsOpen;

    constructor(uint256 _betPrice, uint256 _betFee) {
        
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

}