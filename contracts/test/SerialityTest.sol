pragma solidity ^0.4.2;

import "../installed_contracts/Seriality/Seriality.sol";
import "../Token.sol";
import "../ERC223ReceivingContract.sol";

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
}

// Consumes more gas in current version
/*contract TestEvent {
    using EventLib for EventLib.EventData;

    uint constant public meta_version = 1;
    address public owner;
    EventLib.EventData public data;

    function TestEvent(address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) {
        owner = msg.sender;

        data.initEvent(_creator, _deposit, _startDate, _endDate, _resultsCount);
    }

    function addResult(uint64 customCoefficient) public {
        require(msg.sender == owner);

        data.addResult(customCoefficient);
    }
}*/

contract TestEvent is ERC223ReceivingContract {
    enum Statuses { Created, Published, Accepted, Started, Judging, Finished }

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint64 betSum;
    }

    Token token;
    address creator;

    uint64 deposit;
    uint64 startDate;
    uint64 endDate;
    bytes32 bidType;
    uint8 resultsCount;

    Statuses status;
    Result[] possibleResults;

    uint constant public meta_version = 1;
    address public owner;

    function TestEvent(address _token, address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) {
        owner = msg.sender;

        token = Token(_token);
        creator = _creator;
        deposit = _deposit;
        startDate = _startDate;
        endDate = _endDate;
        resultsCount = _resultsCount;
    }

    function addResult(uint64 customCoefficient) public {
        require(msg.sender == owner);

        possibleResults.push(Result(customCoefficient, 0, 0));

        if (possibleResults.length == resultsCount) {
            status = Statuses.Published;
        }
    }

    function tokenFallback(address _from, uint _value, bytes _data) {

    }

    function getShare(address user) constant returns (uint256) {
        if (user == creator) {
            return token.balanceOf(address(this));
        } else {
            return 0;
        }
    }

    function withdraw() {
        bytes memory empty;
        token.transfer(msg.sender, getShare(msg.sender), empty);
    }
}

contract SerialityTest is Seriality {
    using EventLib for EventLib.EventData;

    uint constant public meta_version = 1;
    EventLib.EventData[] public events;

    event NewEvent(address indexed eventAddress, bytes eventData);

    Token token;

    function SerialityTest(address _token) {
        token = Token(_token);
    }

    function tokenFallback(address _from, uint _value, bytes memory _data) {
        address lastEvent = testSampleEvent(_data);
        bytes memory empty;
        token.transfer(lastEvent, _value, empty);
    }

    // Mapping:
    // ... | string tagName_2 | string tagName_1
    // ... | string result_3Description | string result_2Description | string result_1Description
    // string sourceUrl
    // string description
    // string name
    // bytes32 bidType
    // bytes2 locale
    // ... | uint result_3Coefficient | uint result_2Coefficient | uint result_1Coefficient
    // uint8 tagsCount | uint8 resultsCount | uint64 endDate | uint64 startDate | uint64 deposit
    function testSampleEvent(bytes memory buffer) public returns (address) {
        uint64 _deposit;
        uint64 _startDate;
        uint64 _endDate;
        uint8 _resultsCount;
        uint64 _resultCoefficient;

        uint nameLength;
        string memory name;

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

        TestEvent lastEvent = new TestEvent(address(token), msg.sender, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = bytesToUint64(offset, buffer);
            offset -= 8; // sizeOfUint(64);

            lastEvent.addResult(_resultCoefficient);
        }

        NewEvent(address(lastEvent), buffer);

        return address(lastEvent);
    }

    function testEmptyEvent() public {
        bytes memory buffer = new  bytes(200);

        TestEvent lastEvent = new TestEvent(0, msg.sender, 0, 0, 0, 0);

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

        EventLib.EventData storage lastEvent;
        lastEvent.initEvent(msg.sender, _deposit, _startDate, _endDate, _resultsCount);

        for (uint i = 0; i < _resultsCount; i++) {
            _resultCoefficient = bytesToUint64(offset, buffer);
            offset -= 8; // sizeOfUint(64);

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

        intToBytes(offset, out2, buffer);
        offset -= sizeOfInt(8);

        uintToBytes(offset, out3, buffer);
        offset -= sizeOfUint(24);

        stringToBytes(offset, bytes(out5), buffer);
        offset -= sizeOfString(out5);

        stringToBytes(offset, bytes(out4), buffer);
        offset -= sizeOfString(out4);

        intToBytes(offset, out1, buffer);
        offset -= sizeOfInt(256);

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

        n2 = bytesToInt8(offset, buffer);
        offset -= sizeOfInt(8);

        n3 = bytesToUint24(offset, buffer);
        offset -= sizeOfUint(24);

        bytesToString(offset, buffer, bytes(n5));
        offset -= sizeOfString(out5);

        bytesToString(offset, buffer, bytes(n4));
        offset -= sizeOfString(out4);

        n1 = bytesToInt256(offset, buffer);

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

        n1 = bytesToInt8(offset, buffer);
        offset -= sizeOfInt(8);

        n2 = bytesToInt24(offset, buffer);
        offset -= sizeOfUint(24);

        n3 = bytesToUint8(offset, buffer);
        offset -= sizeOfInt(32);

        n4 = bytesToInt128(offset, buffer);
        offset -= sizeOfUint(128);

        n5 = bytesToAddress(offset, buffer);
        offset -= sizeOfAddress();

        n6 = bytesToAddress(offset, buffer);

        Sample2(n1, n2, n3, n4, n5, n6);
    }


    event Sample3(address n1, bytes buffer);

    function testSample3(bytes memory buffer) public returns(address n1) {
        uint offset = 20;

        n1 = bytesToAddress(offset, buffer);

        Sample3(n1, buffer);
    }
}
