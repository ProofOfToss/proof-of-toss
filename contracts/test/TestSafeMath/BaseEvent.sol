pragma solidity ^0.4.2;

import "./Token.sol";
import "../../installed_contracts/SafeMath.sol";

contract TestSafeMath {

    using SafeMath for uint256;

    Token public token;
    address public owner;
    uint64 public deposit;
    uint8 public resolvedResult;

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint64 betSum;
        uint64 voteSum;
    }

    struct Bet {
        uint timestamp;
        address bettor;
        uint8 result;
        uint64 amount;
    }

    struct Vote {
        address voter;
        uint8 result;
        uint64 deposit;
    }

    Result[] public possibleResults;
    Bet[] public bets;
    mapping (address => uint[]) public usersBets;
    mapping (address => Vote) public votes;

    function TestSafeMath() public {
        token = new Token();

        owner = msg.sender;
        deposit = 1000000;
        resolvedResult = 0;

        addResult(30);
        addResult(70);

        addBet(0x14723a09acff6d2a60dcdf7aa4aff308fddc160c, 0, 1000000);
        addBet(0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db, 1, 2000000);
        addBet(0x583031d1113ad414f02576bd6afabfb302140225, 1, 500000);

        //Correct voice with 0.1 deposit
        addVote(0, 0x1, 1000);
        addVote(0, 0x2, 1000);
        addVote(0, 0x3, 1000);
        addVote(0, 0x4, 1000);
        addVote(0, 0x5, 1000);
        addVote(0, 0x6, 1000);
        addVote(0, 0x7, 1000);
        addVote(0, 0x8, 1000);
        addVote(0, 0x9, 1000);
        addVote(0, 0x10, 1000);
        addVote(0, 0x11, 1000);
        addVote(0, 0x12, 1000);
        addVote(0, 0x13, 1000);
        addVote(0, 0x14, 1000);
        addVote(0, 0x15, 1000);
        addVote(0, 0x16, 1000);
        addVote(0, 0x17, 1000);
        addVote(0, 0x18, 1000);
        addVote(0, 0x19, 1000);
        addVote(0, 0x20, 1000);
        addVote(0, 0x21, 1000);
        addVote(0, 0x22, 1000);
        addVote(0, 0x23, 1000);
        addVote(0, 0x24, 1000);
        addVote(0, 0x25, 1000);

        //Correct voice with 0.2 deposit
        addVote(0, 0x26, 2000);
        addVote(0, 0x27, 2000);
        addVote(0, 0x28, 2000);
        addVote(0, 0x29, 2000);
        addVote(0, 0x30, 2000);
        addVote(0, 0x31, 2000);
        addVote(0, 0x32, 2000);
        addVote(0, 0x33, 2000);
        addVote(0, 0x34, 2000);
        addVote(0, 0x35, 2000);
        addVote(0, 0x36, 2000);
        addVote(0, 0x37, 2000);
        addVote(0, 0x38, 2000);
        addVote(0, 0x39, 2000);
        addVote(0, 0x40, 2000);
        addVote(0, 0x41, 2000);
        addVote(0, 0x42, 2000);
        addVote(0, 0x43, 2000);
        addVote(0, 0x44, 2000);
        addVote(0, 0x45, 2000);

        //Inorrect voice with 0.2 deposit
        addVote(1, 0x46, 2000);
        addVote(1, 0x47, 2000);
        addVote(1, 0x48, 2000);
        addVote(1, 0x49, 2000);
        addVote(1, 0x50, 2000);
    }

    function addResult(uint64 customCoefficient) public {
        possibleResults.push(Result(customCoefficient, 0, 0, 0));
    }

    function addBet(address sender, uint8 result, uint64 amount) private {
        bets.push(Bet(now, sender, result, amount));

        possibleResults[result].betCount += 1;
        possibleResults[result].betSum += amount;

        usersBets[sender].push(bets.length - 1);
    }

    /**
     * Voting function
     */
    function addVote(uint8 result, address user, uint64 deposit) private {
        // Vote vote = Vote(user, result, deposit);
        votes[user] = Vote(user, result, deposit);
        possibleResults[result].voteSum += deposit;
    }

    /*-----------------------Helper functions----------------------*/

    function generateTokens() payable public {
        token.generateTokens(address(this), 4575000);
    }

    function getEventBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getBalance(address user) public view returns (uint256) {
        return token.balanceOf(user);
    }

    /*-----------------------Withdraw event creator----------------------*/

    /**
     * Withdraw event creator tokens
     */
    function withdrawEventCreator() public returns (bool) {
        uint256 withdrawSum = 0;
        if(owner == owner) {
            withdrawSum += deposit;
            withdrawSum += getEventCreatorReward();
        }

        assert(token.balanceOf(address(this)) > withdrawSum);

        token.transfer(owner, withdrawSum);
    }

    function calculateHalfPercentBetsSum() public view returns (uint256) {
        uint256 resultCount = possibleResults.length;
        uint256 betsSum = 0;
        for(uint256 i = 0; i < resultCount; i++ ) {
            betsSum += possibleResults[i].betSum;
        }

        return betsSum.mul(5).div(1000);
    }

    /**
     * Return event creator reward
     */
    function getEventCreatorReward() private view returns (uint256) {
        uint256 eventCreatorPercent = calculateHalfPercentBetsSum();

        if(eventCreatorPercent < deposit) {
            return eventCreatorPercent;
        }

        return deposit;
    }

    /*-----------------------Withdraw bettor----------------------*/

    /**
     * Main function for withdraw bettor tokens.
     * Should be public in real contract
     */
    function withdrawBettor(uint256 betIndex, address user) private returns (uint256) {
        Bet bet = bets[betIndex];

        assert(bet.bettor == user);
        assert(bet.result == resolvedResult);

        uint256 loosersBetSum = calculateLosersBetSum();
        uint256 winnerCount = possibleResults[resolvedResult].betCount;

        uint256 userBetAmount = bet.amount;

        uint256 prize = (userBetAmount.mul(99).div(100)) + (loosersBetSum.mul(99).div(100) / winnerCount);

        assert(token.balanceOf(address(this)) > prize);

        token.transfer(user, prize);

        return prize;
    }

    /**
     * Test function
     * Return bettorA tokens
     */
    function withdrawBettorA() public returns (uint256) {
        return withdrawBettor(0, 0x14723a09acff6d2a60dcdf7aa4aff308fddc160c);
    }

    /**
     * Test function
     * Throw exception because of result 1 is not winning
     */
    function withdrawBettorB() public returns (uint256) {
        return withdrawBettor(1, 0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db);
    }

    /**
     * Return losers bet sum
     */
    function calculateLosersBetSum() private view returns (uint256) {
        uint256 resultCount = possibleResults.length;
        uint256 loosersBetSum = 0;
        for(uint256 i = 0; i < resultCount; i++ ) {
            if(i == resolvedResult) {
                continue;
            }

            loosersBetSum += possibleResults[i].betSum;
        }

        return loosersBetSum;
    }

    /*-----------------------Withdraw judge----------------------*/

    function withdrawVoter(address user) private returns (uint256) {
        Vote vote = votes[user];

        assert(vote.result == resolvedResult);

        uint256 eventCreatorPercent = calculateHalfPercentBetsSum();
        uint64 incorrectVotesSum = calculateIncorrectVotesSum();
        Result result = possibleResults[vote.result];

        uint64 votersCorrectSum = result.voteSum;
        uint256 voterReward = 0;

        voterReward += eventCreatorPercent;
        voterReward += incorrectVotesSum;

        if(eventCreatorPercent > deposit) {
            voterReward += eventCreatorPercent - deposit;
        }

        voterReward = voterReward * votes[user].deposit;
        voterReward = voterReward / votersCorrectSum;

        voterReward += vote.deposit;

        token.transfer(user, voterReward);

        //Return for test
        return voterReward;
    }

    /**
     * Return 423 tokens
     */
    function withdrawVoter0() public view returns (uint256) {
        return withdrawVoter(0x1);
    }

    /**
     * Return 846 tokens
     */
    function withdrawVoter26() public view returns (uint256) {
        return withdrawVoter(0x26);
    }

    /**
    * Throw exception
    */
    function withdrawVoter46() public view returns (uint256) {
        return withdrawVoter(0x46);
    }

    /**
     *
     */
    function calculateIncorrectVotesSum() public view returns (uint64) {
        uint256 resultCount = possibleResults.length;
        uint64 incorrectVotesSum = 0;

        for(uint8 i = 0; i < resultCount; i++ ) {
            if(i == resolvedResult) {
                continue;
            }

            incorrectVotesSum += possibleResults[i].voteSum;
        }

        return incorrectVotesSum;
    }
}