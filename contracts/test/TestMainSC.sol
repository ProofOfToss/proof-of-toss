pragma solidity ^0.4.2;

import "../Main.sol";

contract TestMainSC is Main {
    address lastEvent;

    constructor(address _token, address _whitelist, address _eventBase) public Main(_token, _whitelist, _eventBase) {}

    function tokenFallback(address _from, uint _value, bytes memory _data) public {
        lastEvent = newEvent(_from, uint64(_value), _data);
        token.transfer(lastEvent, _value);
    }

    function getLastEvent() public constant returns (address) {
        return lastEvent;
    }
}
