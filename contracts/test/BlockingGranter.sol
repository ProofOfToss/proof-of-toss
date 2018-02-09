pragma solidity ^0.4.2;

import "../Token.sol";

contract BlockingGranter {
    Token token;

    function BlockingGranter(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    function grant(address _owner, address _contract) {
        token.allowBlocking(_owner, _contract);
    }
}
