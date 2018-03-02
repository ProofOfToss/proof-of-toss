pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";

import "../contracts/test/Blocker.sol";
import "../contracts/test/BlockingGranter.sol";

contract TestToken {

    function testInitialBalanceUsingDeployedContract() {
        Token token = Token(DeployedAddresses.Token());

        uint expected = 10000000000000;

        Assert.equal(token.balanceOf(tx.origin), expected, "Owner should have 10000000000000 tokens initially");
    }

    function testBlocking() {
        Token token = Token(DeployedAddresses.Token());
        BlockingGranter blockingGranter = BlockingGranter(DeployedAddresses.BlockingGranter());
        Blocker blocker = Blocker(DeployedAddresses.Blocker());

        token.generateTokens(address(this), 10000000000000);

        Assert.equal(token.balanceOf(address(this)), 10000000000000, "Owner should have 10000000000000 tokens initially");

        token.grantToAllowBlocking(address(blockingGranter), true);

        Assert.equal(token.grantedToAllowBlocking(address(this), address(blockingGranter)), true, "Permission should be granted");

        blockingGranter.grant(address(this), address(blocker));

        blocker.block(address(this), 10000000000000);

        Assert.equal(token.balanceOf(address(this)), 0, "Owner should have 0 tokens after block");

        blocker.unblock(address(this), 1000);

        Assert.equal(token.balanceOf(address(this)), 1000, "Owner should have 0 tokens after unblock");
    }

}
