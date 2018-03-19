pragma solidity ^0.4.2;

import "./Token.sol";
import "./Event.sol";
import "./ERC223ReceivingContract.sol";

contract Main is ERC223ReceivingContract {
    Token token;
    uint8 version = 1;
    Event lastEvent;
    mapping (address => bool) public whitelist;
    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    function Main(address _token) {
        owner = msg.sender;

        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(string eventName, uint256 indexed createdTimestamp, address indexed eventAddress, address indexed eventCreator);

    function tokenFallback(address _from, uint _value, bytes _data) {

    }

    function newEvent(string name, uint deposit, string description,
        uint operatorId, string eventData, string sourceUrl, string tags, string results
    ) returns (address) {
        require(whitelist[msg.sender] == true);

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

    function updateWhitelist(address user, bool whitelisted) public onlyOwner {
        whitelist[user] = whitelisted;
    }
}
