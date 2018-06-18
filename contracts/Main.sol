pragma solidity ^0.4.2;

import "./token-sale-contracts/TokenSale/Token/Token.sol";
import "./Event.sol";
import "./EventBase.sol";
import "./Whitelist.sol";
import "./token-sale-contracts/TokenSale/ERC223ReceivingContract.sol";

contract Main is ERC223ReceivingContract {
    Token token;
    Whitelist whitelist;
    EventBase public eventBase;
    uint8 version = 1;

    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier contractOnly(address _to) {
        uint256 codeLength;

        assembly {
        // Retrieve the size of the code on target address, this needs assembly .
        codeLength := extcodesize(_to)
        }

        require(codeLength > 0);

        _;
    }

    constructor(address _token, address _whitelist, address _eventBase) public {
        owner = msg.sender;

        token = Token(_token);
        whitelist = Whitelist(_whitelist);
        eventBase = EventBase(_eventBase);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    function getToken() public constant returns (address) {
        return address(token);
    }

    event NewEvent(address indexed eventAddress, uint256 deposit, bytes eventData);

    function tokenFallback(address _from, uint256 _value, bytes memory _data) public {
        token.transfer(newEvent(_from, _value, _data), _value);
    }

    function updateEventBase(address _eventBase) public onlyOwner contractOnly(_eventBase) {
        require(_eventBase != address(0));
        eventBase = EventBase(_eventBase);
    }

    function newEvent(address _creator, uint256 _deposit, bytes memory buffer) internal returns (address) {
        require(whitelist.whitelist(tx.origin) == true);
        require(token.grantedToSetUnpausedWallet(address(this)) == true);

        EventBase _lastEvent = EventBase(address(new Event(address(eventBase))));
        _lastEvent.init(address(token), address(whitelist), _creator, _deposit, buffer);

        token.setUnpausedWallet(address(_lastEvent), true);

        emit NewEvent(
            address(_lastEvent),
            _deposit,
            buffer
        );

        return address(_lastEvent);
    }
}
