pragma solidity ^0.4.2;

import "../../installed_contracts/SafeMath.sol";

contract TestSafeMathToken {

    using SafeMath for uint;

    string public standard = 'Token 0.1';
    string public name = 'TOSS';
    string public symbol = 'TOSS';
    uint8 public decimals = 4;

    mapping (address => uint256) public balanceOf;

    function generateTokens(address _user, uint256 _value) public {
        balanceOf[_user] += _value;
    }

    function transfer(address to, uint value) public {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
    }
}
