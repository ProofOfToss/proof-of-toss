pragma solidity ^0.4.2;

import "../installed_contracts/Seriality/Seriality.sol";
import "../installed_contracts/SerialityLib.sol";
import "../Token.sol";
import "../ERC223ReceivingContract.sol";
import "./TestEventBase.sol";

library EventLib {
    enum Statuses { Created, Published, Accepted, Started, Judging, Finished }

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint64 betSum;
    }

    struct EventData {
        address creator;

        uint64 deposit;
        uint64 startDate;
        uint64 endDate;
        bytes32 bidType;
        uint8 resultsCount;

        EventLib.Statuses status;
        EventLib.Result[] possibleResults;
    }

    function initEvent(EventData storage data, address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) internal {
        data.creator = _creator;
        data.deposit = _deposit;
        data.startDate = _startDate;
        data.endDate = _endDate;
        data.resultsCount = _resultsCount;
    }

    function addResult(EventData storage data, uint64 customCoefficient) internal {
        data.possibleResults.push(Result(customCoefficient, 0, 0));

        if (data.possibleResults.length == data.resultsCount) {
            data.status = Statuses.Published;
        }
    }

    function getShare(EventData storage data, address user) internal returns (uint256) {
        if (user == data.creator) {
            return TestEventBase(this).token().balanceOf(address(this));
        } else {
            return 0;
        }
    }

    function withdraw(EventData storage data) internal {
        bytes memory empty;
        TestEventBase(this).token().transfer(msg.sender, getShare(data, msg.sender), empty);
    }
}

/*// Consumes more gas in current version
contract TestEvent is ERC223ReceivingContract {
    using EventLib for EventLib.EventData;

    uint constant public meta_version = 1;
    address public owner;
    EventLib.EventData public data;

    Token public token;

    function TestEvent(address _token, address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) {
        owner = msg.sender;

        token = Token(_token);

        data.initEvent(_creator, _deposit, _startDate, _endDate, _resultsCount);
    }

    function addResult(uint32 customCoefficient) public {
        require(msg.sender == owner);

        data.addResult(customCoefficient);
    }

    function getShare(address user) constant returns (uint256) {
        return data.getShare(user);
    }

    function withdraw() {
        data.withdraw();
    }

    function tokenFallback(address _from, uint _value, bytes _data) {

    }
}*/

contract TestEvent {
    TestEventBase public base;
    address public owner;

    function TestEvent(address _base) {
        owner = msg.sender;
        base = TestEventBase(_base);
    }

    function() public {
        assembly {
            let _target := sload(0)
            calldatacopy(0x0, 0x0, calldatasize)
            let retval := delegatecall(gas, _target, 0x0, calldatasize, 0x0, 0)
            let returnsize := returndatasize
            returndatacopy(0x0, 0x0, returnsize)
            switch retval case 0 {revert(0, 0)} default {return (0, returnsize)}
        }
    }
}

contract SerialityTest {
    using EventLib for EventLib.EventData;

    uint constant public meta_version = 1;
    EventLib.EventData[] public events;

    event NewEvent(address indexed eventAddress, bytes eventData);

    Token token;
    TestEventBase eventBase;

    function SerialityTest(address _token, address _eventBase) {
        token = Token(_token);
        eventBase = TestEventBase(_eventBase);
    }

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        bytes memory empty;
        token.transfer(testSampleEvent(_data), _value, empty);
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
    function testSampleEvent(bytes memory buffer) public returns (address) {
        uint64 _deposit;
        uint64 _startDate;
        uint64 _endDate;
        uint8 _resultsCount;
        uint64 _resultCoefficient;

        uint offset = buffer.length;

        _deposit = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _startDate = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _endDate = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _resultsCount = SerialityLib.bytesToUint8(offset, buffer);
        offset -= 1; // SerialityLib.sizeOfUint(8);

        // bypass tagsCount
        offset -= 1; // SerialityLib.sizeOfUint(8);

        // TestEvent lastEvent = new TestEvent(address(token), msg.sender, _deposit, _startDate, _endDate, _resultsCount);

        TestEventBase lastEvent = TestEventBase(address(new TestEvent(address(eventBase))));

        lastEvent.init(address(token), msg.sender, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = SerialityLib.bytesToUint64(offset, buffer);
            offset -= 8; // SerialityLib.sizeOfUint(64);

            lastEvent.addResult(_resultCoefficient);
        }

        NewEvent(
            address(lastEvent),
            buffer
        );

        return address(lastEvent);
    }

    function testEmptyEvent() public {
        bytes memory buffer = new  bytes(200);

        TestEvent lastEvent = new TestEvent(0/*, msg.sender, 0, 0, 0, 0*/);

        for (uint i = 0; i < 3; i++) {
            //lastEvent.addResult(1);
        }

        NewEvent(address(lastEvent), buffer);
    }

    function testSampleEventNoContract(bytes memory buffer) public {
        uint64 _deposit;
        uint64 _startDate;
        uint64 _endDate;
        uint8 _resultsCount;
        uint64 _resultCoefficient;

        uint nameLength;
        string memory name;

        uint offset = buffer.length;

        _deposit = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _startDate = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _endDate = SerialityLib.bytesToUint64(offset, buffer);
        offset -= 8; // SerialityLib.sizeOfUint(64);

        _resultsCount = SerialityLib.bytesToUint8(offset, buffer);
        offset -= 1; // SerialityLib.sizeOfUint(8);

        // bypass tagsCount
        offset -= 1; // SerialityLib.sizeOfUint(8);

        EventLib.EventData storage lastEvent;
        lastEvent.initEvent(msg.sender, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = SerialityLib.bytesToUint64(offset, buffer);
            offset -= 8; // SerialityLib.sizeOfUint(64);

            lastEvent.addResult(_resultCoefficient);
        }

        events.push(lastEvent);

        NewEvent(address(events.length), buffer);
    }

    event Sample1(int n1, int8 n2, uint24 n3, string n4, string n5);
    event Sample1Serializing(bytes buffer);

    function testSample1Serializing() public returns(int n1, int8 n2, uint24 n3, string n4,string n5) {

        bytes memory buffer = new  bytes(200);
        string memory out4  = new string(32);
        string memory out5  = new string(32);
        n4 = new string(32);
        n5 = new string(32);
        int     out1 = 34444445;
        int8    out2 = 87;
        uint24  out3 = 76545;
        out4 = "Copy kon lashi";
        out5 = "Bia inja dahan service";

        // Serializing
        uint offset = 200;

        SerialityLib.intToBytes(offset, out2, buffer);
        offset -= SerialityLib.sizeOfInt(8);

        SerialityLib.uintToBytes(offset, out3, buffer);
        offset -= SerialityLib.sizeOfUint(24);

        SerialityLib.stringToBytes(offset, bytes(out5), buffer);
        offset -= SerialityLib.sizeOfString(out5);

        SerialityLib.stringToBytes(offset, bytes(out4), buffer);
        offset -= SerialityLib.sizeOfString(out4);

        SerialityLib.intToBytes(offset, out1, buffer);
        offset -= SerialityLib.sizeOfInt(256);

        Sample1Serializing(buffer);
    }

    function testSample1(bytes memory buffer) public returns(int n1, int8 n2, uint24 n3, string n4,string n5) {

        // bytes memory buffer = new  bytes(200);
        // string memory out4  = new string(32);
        // string memory out5  = new string(32);
        n4 = new string(32);
        n5 = new string(32);
        // int     out1 = 34444445;
        // int8    out2 = 87;
        // uint24  out3 = 76545;
        string memory out4 = "Copy kon lashi";
        string memory out5 = "Bia inja dahan service";

        // Deserializing
        uint offset = 200;

        n2 = SerialityLib.bytesToInt8(offset, buffer);
        offset -= SerialityLib.sizeOfInt(8);

        n3 = SerialityLib.bytesToUint24(offset, buffer);
        offset -= SerialityLib.sizeOfUint(24);

        SerialityLib.bytesToString(offset, buffer, bytes(n5));
        offset -= SerialityLib.sizeOfString(out5);

        SerialityLib.bytesToString(offset, buffer, bytes(n4));
        offset -= SerialityLib.sizeOfString(out4);

        n1 = SerialityLib.bytesToInt256(offset, buffer);

        Sample1(n1, n2, n3, n4, n5);
    }

    event Sample2(int8 n1, int24 n2, uint32 n3, int128 n4, address n5, address n6);

    function testSample2(bytes memory buffer) public returns(int8 n1, int24 n2, uint32 n3, int128 n4, address n5, address n6) {

        // bytes memory buffer = new bytes(64);
        // int8    out1 = -12;
        // int24   out2 = 838860;
        // uint32  out3 = 333333333;
        // int128  out4 = -44444444444;
        // address out5 = 0x15B7926835A7C2FD6D297E3ADECC5B45F7309F59;
        // address out6 = 0x1CB5CF010E407AFC6249627BFD769D82D8DBBF71;

        // Deserializing
        uint offset = 64;

        n1 = SerialityLib.bytesToInt8(offset, buffer);
        offset -= SerialityLib.sizeOfInt(8);

        n2 = SerialityLib.bytesToInt24(offset, buffer);
        offset -= SerialityLib.sizeOfUint(24);

        n3 = SerialityLib.bytesToUint8(offset, buffer);
        offset -= SerialityLib.sizeOfInt(32);

        n4 = SerialityLib.bytesToInt128(offset, buffer);
        offset -= SerialityLib.sizeOfUint(128);

        n5 = SerialityLib.bytesToAddress(offset, buffer);
        offset -= SerialityLib.sizeOfAddress();

        n6 = SerialityLib.bytesToAddress(offset, buffer);

        Sample2(n1, n2, n3, n4, n5, n6);
    }


    event Sample3(address n1, bytes buffer);

    function testSample3(bytes memory buffer) public returns(address n1) {
        uint offset = 20;

        n1 = SerialityLib.bytesToAddress(offset, buffer);

        Sample3(n1, buffer);
    }
}
