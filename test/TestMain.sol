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

        main.updateWhitelist(creator, true);

        address eventAddress = main.newEvent('Test event', 10000000, 'description', 1,
            'category_id.en.1517406195.1580478195', 'source_url', 'en.tag1_name.en.tag2_name.en.tag3_name',
            "result_description_1.10"
        );

//        Assert.equal(eventAddress != 0, true, "Event should be created");

        Assert.equal(token.balanceOf(creator), 9999990000000, "Owner should have 999999000 tokens after event deposit");

        Event _event = Event(eventAddress);
        Assert.equal(address(token), _event.getToken(), "Event.token should be the same as token");
        Assert.equal(creator, _event.getCreator(), "Event.creator should match account address");
//         Assert.equal(now, _event.getCreatedTimestamp(), "Event.createdTimestamp should be now");

        Assert.equal(token.balanceOf(eventAddress), 10000000, "Event balance should match deposit");

        _event.withdraw();

        Assert.equal(token.balanceOf(creator), 10000000000000, "Owner should have 10000000000000 tokens after withdraw");
        Assert.equal(token.balanceOf(eventAddress), 0, "Event balance should be 0 after withdraw");
    }
}
