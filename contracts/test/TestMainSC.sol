pragma solidity ^0.4.2;

import "../Main.sol";

contract TestMainSC is Main {
    address lastEvent;

    function TestMainSC(address _token, address _whitelist, address _eventBase) Main(_token, _whitelist, _eventBase) {}

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        bytes memory empty;
        lastEvent = newEvent(_from, uint64(_value), _data);
        token.transfer(lastEvent, _value);
    }

    function getLastEvent() constant returns (address) {
        return lastEvent;
    }
}
