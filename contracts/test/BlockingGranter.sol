pragma solidity ^0.4.2;

import "../token-sale-contracts/TokenSale/Token/Token.sol";

contract BlockingGranter {
    Token token;

    constructor(address _token) public {
        token = Token(_token);
    }

    function getToken() public constant returns (address) {
        return address(token);
    }

    function grant(address _owner, address _contract) public {
        token.allowBlocking(_owner, _contract);
    }
}
