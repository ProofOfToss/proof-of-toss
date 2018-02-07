pragma solidity ^0.4.2;

import "./Token.sol";
import "./Event.sol";

contract Main {
    Token token;
    uint8 version = 1;

    function Main(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(string eventName, uint256 indexed createdTimestamp, address indexed eventAddress, address indexed eventCreator);

    function newEvent(string name, uint256 deposit, bytes2 locale, bytes32 category, string[] tags, string description,
        uint operatorId, uint64 startDate, uint64 endDate, string sourceUrl, string[] possibleResults
    ) returns (address) {

        Event lastEvent = new Event(msg.sender, name, deposit, locale, category, tags, description, startDate, endDate,
            sourceUrl, possibleResults);
        token.transferFrom(msg.sender, address(lastEvent), deposit);
        NewEvent(name, uint(now), address(lastEvent), msg.sender);

        return address(lastEvent);
    }

    function getLastEvent() constant returns (address) {
        return address(lastEvent);
    }
}
