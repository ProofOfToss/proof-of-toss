pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/token-sale-contracts/TokenSale/Token/Token.sol";

import "../contracts/test/Blocker.sol";
import "../contracts/test/BlockingGranter.sol";

contract TestToken {

    function testInitialBalanceUsingDeployedContract() {
        Token token = new Token();

        token.setPause(false);
        token.mint(address(this), 10000000000000);

        uint expected = 10000000000000;

        Assert.equal(token.balanceOf(address(this)), expected, "Owner should have 10000000000000 tokens initially");
    }

    function testBlocking() {
        Token token = new Token();

        token.setPause(false);
        token.mint(address(this), 10000000000000);

        BlockingGranter blockingGranter = new BlockingGranter(token);
        Blocker blocker = new Blocker(token);

        Assert.equal(token.balanceOf(address(this)), 10000000000000, "Owner should have 10000000000000 tokens initially");

        token.grantToAllowBlocking(address(blockingGranter), true);

        Assert.equal(token.grantedToAllowBlocking(address(this), address(blockingGranter)), true, "Permission should be granted");

        blockingGranter.grant(address(this), address(blocker));

        blocker.blockTokens(address(this), 10000000000000);

        Assert.equal(token.balanceOf(address(this)), 0, "Owner should have 0 tokens after block");

        blocker.unblockTokens(address(this), 1000);

        Assert.equal(token.balanceOf(address(this)), 1000, "Owner should have 0 tokens after unblock");
    }

}
