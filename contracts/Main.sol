pragma solidity ^0.4.2;

import "./Token.sol";
import "./Event.sol";

contract Main {
    Token token;
    uint8 version = 1;
    Event lastEvent;

    function Main(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(string eventName, uint256 indexed createdTimestamp, address indexed eventAddress, address indexed eventCreator);

    function newEvent(string name, uint deposit, string description,
        uint operatorId, string eventData, string sourceUrl, string tags, string results
    ) returns (address) {

        lastEvent = new Event(msg.sender, address(token), name, deposit, description, eventData,
            sourceUrl, tags, results);

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
