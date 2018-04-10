pragma solidity ^0.4.2;

import "../token-sale-contracts/TokenSale/Token/Token.sol";

contract Blocker {
    Token token;

    function Blocker(address _token) {
        token = Token(_token);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    function blockTokens(address _owner, uint amount) {
        token.blockTokens(_owner, amount);
    }

    function unblockTokens(address _owner, uint amount) {
        token.unblockTokens(_owner, _owner, amount);
    }

    function unblockTokensTo(address _owner, address _receiver, uint amount) {
        token.unblockTokens(_owner, _receiver, amount);
    }
}
