pragma solidity ^0.4.2;

contract Whitelist {
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

    function Whitelist() {
        owner = msg.sender;
    }

    function updateWhitelist(address user, bool whitelisted) public onlyOwner {
        whitelist[user] = whitelisted;
    }
}
