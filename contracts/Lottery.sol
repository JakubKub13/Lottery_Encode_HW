//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Lottery {
    uint256 public num;

    constructor(uint256 _num) {
        num = _num;
    }
}