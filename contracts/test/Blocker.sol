pragma solidity ^0.4.2;

import "../token-sale-contracts/TokenSale/Token/Token.sol";

contract Blocker {
    Token token;

    constructor(address _token) public {
        token = Token(_token);
    }

    function getToken() public constant returns (address) {
        return address(token);
    }

    function blockTokens(address _owner, uint amount) public {
        token.blockTokens(_owner, amount);
    }

    function unblockTokens(address _owner, uint amount) public {
        token.unblockTokens(_owner, _owner, amount);
    }

    function unblockTokensTo(address _owner, address _receiver, uint amount) public {
        token.unblockTokens(_owner, _receiver, amount);
    }
}
