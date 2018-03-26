pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/installed_contracts/Seriality/Seriality.sol";
import "../contracts/Token.sol";
import "../contracts/test/TestMainSC.sol";
import "../contracts/EventBase.sol";
import "../contracts/Whitelist.sol";

contract TestMain is Seriality {

    TestMainSC main;
    Token token;
    Whitelist whitelist;
    EventBase eventBase;

    function tokenFallback(address _from, uint _value, bytes _data) public {}

    function testEventCreation() {
        token = Token(DeployedAddresses.Token());
        eventBase = EventBase(DeployedAddresses.EventBase());
        whitelist = Whitelist(DeployedAddresses.Whitelist());
        main = new TestMainSC(token, whitelist, eventBase);

        token.generateTokens(address(this), 10000000000000);

        Assert.equal(address(token), main.getToken(), "Main.token should be the same as token");
        Assert.equal(token.balanceOf(address(this)), 10000000000000, "Owner should have 10000000000000 tokens initially");

        uint deposit = 10000000;
        uint64 startDate = 1517406195;
        uint64 endDate = 1580478195;
        uint8 resultsCount = 2;
        uint8 tagsCount = 3;
        uint64 result_1Coefficient = 10;
        uint64 result_2Coefficient = 20;

        bytes memory buffer = new bytes(200);
        uint offset = 200;

        uintToBytes(offset, startDate, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, endDate, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, resultsCount, buffer); offset -= sizeOfInt(8);
        uintToBytes(offset, tagsCount, buffer); offset -= sizeOfInt(8);
        uintToBytes(offset, result_1Coefficient, buffer); offset -= sizeOfInt(64);
        uintToBytes(offset, result_2Coefficient, buffer); offset -= sizeOfInt(64);


        token.transferERC223(address(main), deposit, buffer);

        Assert.equal(main.getLastEvent() != 0, true, "Event should be created");

        Assert.equal(token.balanceOf(address(this)), 9999990000000, "Owner should have 999999000 tokens after event deposit");

        EventBase _event = EventBase(main.getLastEvent());
        Assert.equal(address(token), _event.token(), "Event.token should be the same as token");
        Assert.equal(address(this), _event.creator(), "Event.creator should match account address");

        Assert.equal(uint(_event.deposit()), deposit, "Event.deposit invalid");
        Assert.equal(uint(_event.startDate()), uint(startDate), "Event.startDate invalid");
        Assert.equal(uint(_event.endDate()), uint(endDate), "Event.endDate invalid");

        Assert.equal(token.balanceOf(address(_event)), 10000000, "Event balance should match deposit");

        Assert.equal(_event.getShare(address(this)), 10000000, "Creator's share should match deposit");

        _event.withdraw();

        Assert.equal(token.balanceOf(address(this)), 10000000000000, "Owner should have 10000000000000 tokens after withdraw");
        Assert.equal(token.balanceOf(address(_event)), 0, "Event balance should be 0 after withdraw");
    }
}
