pragma solidity ^0.4.2;

import "./Token.sol";
import "./Event.sol";
import "./EventBase.sol";
import "./ERC223ReceivingContract.sol";
import "./installed_contracts/Seriality/Seriality.sol";

contract Main is ERC223ReceivingContract, Seriality {
    Token token;
    EventBase eventBase;
    uint8 version = 1;
    Event lastEvent;
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

    function Main(address _token, address _eventBase) {
        owner = msg.sender;

        token = Token(_token);
        eventBase = EventBase(_eventBase);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(address indexed eventAddress, bytes eventData);

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        bytes memory empty;
        token.transfer(newEvent(_from, _data), _value, empty);
    }

    // Mapping:
    // ... | string tagName_2 | string tagName_1
    // ... | string result_3Description | string result_2Description | string result_1Description
    // string sourceUrl
    // string description
    // string name
    // bytes32 bidType
    // bytes2 locale
    // ... | uint64 result_3Coefficient | uint64 result_2Coefficient | uint64 result_1Coefficient
    // uint8 tagsCount | uint8 resultsCount | uint64 endDate | uint64 startDate | uint64 deposit
    function newEvent(address _creator, bytes memory buffer) internal returns (address) {
        uint64 _deposit;
        uint64 _startDate;
        uint64 _endDate;
        uint8 _resultsCount;
        uint64 _resultCoefficient;

        uint offset = buffer.length;

        _deposit = bytesToUint64(offset, buffer);
        offset -= 8; // sizeOfUint(64);

        _startDate = bytesToUint64(offset, buffer);
        offset -= 8; // sizeOfUint(64);

        _endDate = bytesToUint64(offset, buffer);
        offset -= 8; // sizeOfUint(64);

        _resultsCount = bytesToUint8(offset, buffer);
        offset -= 1; // sizeOfUint(8);

        // bypass tagsCount
        offset -= 1; // sizeOfUint(8);

        EventBase lastEvent = EventBase(address(new Event(address(eventBase))));

        lastEvent.init(address(token), _creator, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = bytesToUint64(offset, buffer);
            offset -= 8; // sizeOfUint(64);

            lastEvent.addResult(_resultCoefficient);
        }

        NewEvent(
            address(lastEvent),
            buffer
        );

        return address(lastEvent);
    }


    function getLastEvent() constant returns (address) {
        return address(lastEvent);
    }

    function updateWhitelist(address user, bool whitelisted) public onlyOwner {
        whitelist[user] = whitelisted;
    }
}
