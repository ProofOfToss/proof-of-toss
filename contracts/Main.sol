pragma solidity ^0.4.2;

import "./token-sale-contracts/TokenSale/Token/Token.sol";
import "./Event.sol";
import "./EventBase.sol";
import "./Whitelist.sol";
import "./token-sale-contracts/TokenSale/ERC223ReceivingContract.sol";
import "./installed_contracts/Seriality/Seriality.sol";

contract Main is ERC223ReceivingContract, Seriality {
    Token token;
    Whitelist whitelist;
    EventBase eventBase;
    uint8 version = 1;

    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }

    function Main(address _token, address _whitelist, address _eventBase) {
        owner = msg.sender;

        token = Token(_token);
        whitelist = Whitelist(_whitelist);
        eventBase = EventBase(_eventBase);
    }

    function getToken() constant returns (address) {
        return address(token);
    }

    event NewEvent(address indexed eventAddress, uint64 deposit, bytes eventData);

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        token.transfer(newEvent(_from, uint64(_value), _data), _value);
    }

    // Mapping:
    // ... | string tagName_2 | string tagName_1
    // ... | string result_3Description | string result_2Description | string result_1Description
    // string sourceUrl
    // string description
    // string name
    // bytes32 category
    // bytes32 bidType
    // bytes2 locale
    // ... | uint64 result_3Coefficient | uint64 result_2Coefficient | uint64 result_1Coefficient
    // uint8 tagsCount | uint8 resultsCount | uint64 endDate | uint64 startDate
    function newEvent(address _creator, uint64 _deposit, bytes memory buffer) internal returns (address) {
        require(whitelist.whitelist(tx.origin) == true);
        require(token.grantedToSetUnpausedWallet(address(this)) == true);

        uint64 _startDate;
        uint64 _endDate;
        uint8 _resultsCount;
        uint64 _resultCoefficient;

        uint offset = buffer.length;

        _startDate = bytesToUint64(offset, buffer);
        offset -= 8; // sizeOfUint(64);

        _endDate = bytesToUint64(offset, buffer);
        offset -= 8; // sizeOfUint(64);

        _resultsCount = bytesToUint8(offset, buffer);
        offset -= 1; // sizeOfUint(8);

        // bypass tagsCount
        offset -= 1; // sizeOfUint(8);

        EventBase _lastEvent = EventBase(address(new Event(address(eventBase))));

        _lastEvent.init(address(token), address(whitelist), _creator, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = bytesToUint64(offset, buffer);
            offset -= 8; // sizeOfUint(64);

            _lastEvent.addResult(_resultCoefficient);
        }

        token.setUnpausedWallet(address(_lastEvent), true);

        emit NewEvent(
            address(_lastEvent),
            _deposit,
            buffer
        );

        return address(_lastEvent);
    }
}
