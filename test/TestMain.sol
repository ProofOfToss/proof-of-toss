pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";
import "../contracts/Main.sol";
import "../contracts/Event.sol";

contract TestMain {

    function testEventCreation() {
        Token token = Token(DeployedAddresses.Token());
        Main main = Main(DeployedAddresses.Main());

        address creator = address(this); // tx.origin ?
        token.generateTokens(creator, 1000000000);

        Assert.equal(address(token), main.getToken(), "Main.token should be the same as token");

        Assert.equal(token.balanceOf(creator), 1000000000, "Owner should have 1000000000 tokens initially");

        token.approve(address(main), 1000);

        address eventAddress = main.newEvent(1000);
        Assert.equal(eventAddress != 0, true, "Event shod be created");

        Assert.equal(token.balanceOf(creator), 999999000, "Owner should have 999999000 tokens after event deposit");

        Event _event = Event(eventAddress);
        Assert.equal(address(token), _event.getToken(), "Event.token should be the same as token");
        Assert.equal(creator, _event.getCreator(), "Event.creator should match account address");
        // Assert.equal(now, _event.getCreatedTimestamp(), "Event.createdTimestamp should be now");

        Assert.equal(token.balanceOf(eventAddress), 1000, "Event balance should match deposit");

        _event.withdraw();

        Assert.equal(token.balanceOf(creator), 1000000000, "Owner should have 1000000000 tokens after withdraw");
        Assert.equal(token.balanceOf(eventAddress), 0, "Event balance should be 0 after withdraw");
    }

}
