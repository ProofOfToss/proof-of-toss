pragma solidity ^0.4.2;

import "./Token.sol";
import "./Event.sol";

contract Main {
    Token token;
    Event lastEvent = new Event(0, 0, "");

    function Main(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(string eventName, uint256 indexed createdTimestamp, address indexed eventAddress, address indexed eventCreator);

    function newEvent(uint deposit, string name) returns (address) {
        lastEvent = new Event(msg.sender, address(token), name);

        if (token.allowanceToAllowBlocking(msg.sender, address(this))) {
            token.allowBlocking(msg.sender, address(lastEvent));
        }

        token.transferFrom(msg.sender, address(lastEvent), deposit);
        NewEvent(name, uint(now), address(lastEvent), msg.sender);

        return address(lastEvent);
    }

    function getLastEvent() constant returns (address) {
        return address(lastEvent);
    }
}
