//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Lottery {
    uint256 public closingTime;

    constructor(uint256 _duration) {
        
    }

/// @dev duration is already expressed in seconds
    function openBets(uint256 duration) public {
        closingTime = block.timestamp + duration; //
    }
}