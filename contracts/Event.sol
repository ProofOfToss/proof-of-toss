pragma solidity ^0.4.2;

import "./EventBase.sol";

contract Event {
    EventBase public base;
    address public owner;

    function Event(address _base) {
        owner = msg.sender;
        base = EventBase(_base);
    }

    function() public {
        assembly {
            let _target := sload(0)
            calldatacopy(0x0, 0x0, calldatasize)
            let retval := delegatecall(gas, _target, 0x0, calldatasize, 0x0, 0)
            let returnsize := returndatasize
            returndatacopy(0x0, 0x0, returnsize)
            switch retval case 0 {revert(0, 0)} default {return (0, returnsize)}
        }
    }
}
