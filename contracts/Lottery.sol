//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Lottery {
    uint256 public closingTime;

    constructor(uint256 _betPrice, uint256 _betFee) {
        
    }

/// @param _closingTime target time in seconds expressed in epoch time for the bets to close
    function openBets(uint256 _closingTime) public {
        require(_closingTime > block.timestamp, "Lottery: Closing time must be in the future");
        closingTime = _closingTime;
    }
}