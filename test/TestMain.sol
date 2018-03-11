pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";
import "../contracts/Main.sol";
import "../contracts/Event.sol";

contract TestMain {

    function testEventCreation() {
        Token token = Token(DeployedAddresses.Token());
        Main main = new Main(token);

        address creator = address(this); // tx.origin ?
        token.generateTokens(creator, 10000000000000);

        Assert.equal(address(token), main.getToken(), "Main.token should be the same as token");

        Assert.equal(token.balanceOf(creator), 10000000000000, "Owner should have 10000000000000 tokens initially");

        token.approve(address(main), 10000000);

        uint deposit = 10000000;
        bytes32 bidType = 'bid_type';
        bytes32 categoryId = 'category_id';
        bytes2 locale = 'en';
        uint256 eventStartDate = 1517406195;
        uint256 eventEndDate = 1580478195;
        main.updateWhitelist(creator, true);

        address eventAddress = main.newEvent('Test event', deposit, 'description', 1,
            'bid_type.category_id.en.1517406195.1580478195', 'source_url', 'en.tag1_name.en.tag2_name.en.tag3_name',
            'result_description_1.10.result_description_2.20'
        );

//        Assert.equal(eventAddress != 0, true, "Event should be created");

        Assert.equal(token.balanceOf(creator), 9999990000000, "Owner should have 999999000 tokens after event deposit");

        Event _event = Event(eventAddress);
        Assert.equal(address(token), _event.getToken(), "Event.token should be the same as token");
        Assert.equal(creator, _event.getCreator(), "Event.creator should match account address");

        Assert.equal(_event.deposit(), deposit, "Event.deposit invalid");
        Assert.equal(_event.bidType(), bidType, "Event.bidType invalid");
        Assert.equal(_event.category(), categoryId, "Event.categoryId invalid");
        Assert.equal(_event.locale(), locale, "Event.locale invalid");
        Assert.equal(_event.startDate(), eventStartDate, "Event.startDate invalid");
        Assert.equal(_event.endDate(), eventEndDate, "Event.endDate invalid");

        Assert.equal(token.balanceOf(eventAddress), 10000000, "Event balance should match deposit");

        _event.withdraw();

        Assert.equal(token.balanceOf(creator), 10000000000000, "Owner should have 10000000000000 tokens after withdraw");
        Assert.equal(token.balanceOf(eventAddress), 0, "Event balance should be 0 after withdraw");
    }
}
