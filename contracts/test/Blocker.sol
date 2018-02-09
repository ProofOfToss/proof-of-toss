pragma solidity ^0.4.2;

import "../Token.sol";

contract Blocker {
    Token token;

    function Blocker(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    function block(address _owner, uint amount) {
        token.block(_owner, amount);
    }

    function unblock(address _owner, uint amount) {
        token.unblock(_owner, _owner, amount);
    }

    function unblockTo(address _owner, address _receiver, uint amount) {
        token.unblock(_owner, _receiver, amount);
    }
}
