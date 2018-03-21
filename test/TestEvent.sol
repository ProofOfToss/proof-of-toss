pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";
import "../contracts/Main.sol";
import "../contracts/Event.sol";

contract TestEvent {

    Token token;
    Event _event;

    function beforeEach() {
        token = Token(DeployedAddresses.Token());
        Main main = new Main(token);

        address creator = address(this); // tx.origin ?
        token.generateTokens(creator, 10000000000000);
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

        _event = Event(eventAddress);
    }

    function testNewBet() {
        token.approve(address(_event), 1000000);

        _event.newBet(0, 1000000);

//        uint amount = _event.possibleResults[0].betCount;
//        uint sum = _event.possibleResults[0].betSum;
//
//        Assert.equal(amount, 1, "Amount of bets is invalid");
//        Assert.equal(sum, 1000000, "Sum of bets is invalid");
//        Assert.equal(token.balanceOf(address(_event)), 11000000, "Event balance should match deposit");
    }
}
