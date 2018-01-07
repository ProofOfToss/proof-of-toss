pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Token.sol";

contract TestToken {

	function testInitialBalanceUsingDeployedContract() {
		Token token = Token(DeployedAddresses.Token());

		uint expected = 1000000000;

		Assert.equal(token.balanceOf(tx.origin), expected, "Owner should have 10000000000 tokens initially");
	}

}
