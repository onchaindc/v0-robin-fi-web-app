// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RobinFi {
    string public name = "RobinFi";

    function setName(string calldata _name) external {
        name = _name;
    }
}