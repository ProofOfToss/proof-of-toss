pragma solidity ^0.4.2;

import "./Token.sol";

contract Crowdsale {
    address owner;

    Token token;

    uint start;
    uint period;

    function Crowdsale(uint _start, uint _period, uint icoSoftcap) {
        owner = msg.sender;

        start = _start;
        period = _period;

        token = new Token(start + period*24*60*60, icoSoftcap);
    }

    function transferPreSaleTokens(address to, uint256 value) {
        require(msg.sender == owner);
        require(now > start && now < start + period*24*60*60);

        bytes memory empty;
        token.transfer(to, value, empty);
    }

    function getToken() constant returns (address) {
        return address(token);
    }
}
