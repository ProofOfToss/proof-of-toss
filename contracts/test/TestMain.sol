pragma solidity ^0.4.2;

import "../Main.sol";

contract TestMain is Main {
    address lastEvent;

    function TestMain(address _token, address _eventBase) Main(_token, _eventBase) {}

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        bytes memory empty;
        lastEvent = newEvent(_from, _data);
        token.transferERC223(lastEvent, _value, empty);
    }

    function getLastEvent() constant returns (address) {
        return lastEvent;
    }
}
