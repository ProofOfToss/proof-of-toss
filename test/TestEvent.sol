pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/installed_contracts/Seriality/Seriality.sol";
import "../contracts/Token.sol";
import "../contracts/test/TestMainSC.sol";
import "../contracts/EventBase.sol";
import "../contracts/Event.sol";

contract TestEvent is Seriality {

    TestMainSC main;
    Token token;
    EventBase eventBase;
    EventBase _event;

    function beforeEach() {
        token = Token(DeployedAddresses.Token());
        eventBase = EventBase(DeployedAddresses.EventBase());
        main = new TestMainSC(token, eventBase);

        token.generateTokens(address(this), 10000000000000);
        main.updateWhitelist(address(this), true);

        uint deposit = 10000000;
        uint64 startDate = 1517406195;
        uint64 endDate = 1580478195;
        uint8 resultsCount = 2;
        uint8 tagsCount = 3;
        uint64 result_1Coefficient = 10;
        uint64 result_2Coefficient = 20;
        bytes2 locale = bytes2('en');
        bytes32 bidType = bytes32('bid_type');
        bytes32 category = bytes32('category_id');
        string memory str;

        bytes memory buffer = new bytes(1000);
        uint offset = 1000;

        uintToBytes(offset, startDate, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, endDate, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, resultsCount, buffer); offset -= sizeOfInt(8);
        uintToBytes(offset, tagsCount, buffer); offset -= sizeOfInt(8);
        uintToBytes(offset, result_1Coefficient, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, result_2Coefficient, buffer); offset -= sizeOfInt(64);

        bytes2ToBytes(offset, locale, buffer); offset -= 34;
        bytes32ToBytes(offset, bidType, buffer); offset -= 64;
        bytes32ToBytes(offset, category, buffer); offset -= 64;

        str = 'Test event'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);
        str = 'Description'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);
        str = 'source_url'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);

        str = 'result_description_1'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);
        str = 'result_description_2'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);

        str = 'tag1_name'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);
        str = 'tag2_name'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);
        str = 'tag3_name'; stringToBytes(offset, bytes(str), buffer); offset -= sizeOfString(str);

        token.transferERC223(address(main), deposit, buffer);

        _event = EventBase(main.getLastEvent());
    }

    function testNewBet() {
        token = Token(DeployedAddresses.Token());

        uint8 action = 1; // bet
        uint8 result = 0;

        bytes memory buffer = new bytes(70);
        uint offset = 70;

        uintToBytes(offset, action, buffer); offset -= sizeOfInt(8);
        uintToBytes(offset, result, buffer); offset -= sizeOfInt(8);

        token.transferERC223(address(_event), 1000000, buffer);

        uint coefficient;
        uint count;
        uint sum;
        (coefficient, count, sum) = _event.possibleResults(result);

        Assert.equal(count, 1, "Amount of bets is invalid");
        Assert.equal(sum, 1000000, "Sum of bets is invalid");
        Assert.equal(token.balanceOf(address(_event)), 11000000, "Event balance should match deposit");
    }
}
