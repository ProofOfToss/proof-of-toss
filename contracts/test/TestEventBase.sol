pragma solidity ^0.4.2;

import "../EventBase.sol";

contract TestEventBase is EventBase {
    constructor(address _token) public EventBase(_token) {}

    function setStartDate(uint64 _startDate) public {
        startDate = _startDate;
    }

    function setEndDate(uint64 _endDate) public {
        endDate = _endDate;
    }

    event Updated(address _contract, bytes _data);
}
