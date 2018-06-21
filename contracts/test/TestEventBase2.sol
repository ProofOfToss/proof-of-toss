pragma solidity ^0.4.2;

import "./TestEventBase.sol";

contract TestEventBase2 is TestEventBase {
    uint constant public meta_version = 2;

    constructor(address _token) public TestEventBase(_token) {}

    event Updated(address _contract, bytes _data);
}
