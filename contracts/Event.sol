pragma solidity ^0.4.2;

import "./Token.sol";

contract Event {
    Token token;
    address public creator;
    uint createdTimestamp;
    string name;

    function Event(address _creator, address _token, string _name) {
        creator = _creator;
        name = _name;
        token = Token(_token);
        createdTimestamp = block.timestamp;
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    function getCreator() constant returns (address) {
        return creator;
    }

    function getName() constant returns (string) {
        return name;
    }

    function getCreatedTimestamp() constant returns (uint) {
        return createdTimestamp;
    }

    function getShare(address user) constant returns (uint256) {
        if (user == creator) {
            return token.balanceOf(address(this));
        } else {
            return 0;
        }
    }

    function withdraw() {
        token.transfer(msg.sender, getShare(msg.sender));
    }
}
