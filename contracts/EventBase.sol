pragma solidity ^0.4.2;

import "./installed_contracts/Seriality/Seriality.sol";
import "./token-sale-contracts/TokenSale/Token/Token.sol";
import "./Whitelist.sol";
import "./token-sale-contracts/TokenSale/ERC223ReceivingContract.sol";

contract EventBase is ERC223ReceivingContract, Seriality {
    using SafeMath for uint256;
    using SafeMath for uint32;

    // Declare Event contract's fields because fields must match
    EventBase base;
    address public owner;

    // enum States { Created, Published, Accepted, Started, Finished, Resolved, Dispute, Judging, Closed, Distributed } // Full
    enum States { Created, Published, Accepted, Started, Finished, Closed, Distributed } // Simplified

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint256 betSum;
    }

    struct Bet {
        uint timestamp;
        address bettor;
        uint8 result;
        uint256 amount;
    }

    Token public token;
    Whitelist public whitelist;

    address public creator;
    address public operatorId = 1;
    uint256 public deposit;
    uint64 public startDate;
    uint64 public endDate;
    bytes32 public bidType;
    uint8 public resultsCount;

    States public state;
    Result[] public possibleResults;
    Bet[] public bets;
    mapping (address => uint[]) public usersBets;

    uint8 public resolvedResult; // 255 - not set; 254 – different result; 253 – undefined result; 232 – event was canceled; etc ... todo

    uint constant public meta_version = 1;

    event Updated(address _contract, bytes _data);

    constructor(address _token) public {
        owner = msg.sender;
        token = Token(_token);
    }

    function updated(address _contract, bytes _data) public {
        uint codeLength;

        assembly {
            codeLength := extcodesize(_contract)
        }

        require(codeLength > 0 && msg.sender == _contract);

        emit Updated(_contract, _data);
    }

    function betsCount() public constant returns(uint) {
        return bets.length;
    }

    function userBetsCount(address _user) public constant returns(uint) {
        return usersBets[_user].length;
    }

    function init(address _token, address _whitelist, address _creator, uint256 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) public {
        require(msg.sender == owner);
        require(_resultsCount < 220); // 220 - 255 reserved for special results
        require(_startDate > now + 20 minutes);
        require(_startDate <= _endDate);

        token = Token(_token);
        whitelist = Whitelist(_whitelist);

        creator = _creator;
        deposit = _deposit;
        startDate = _startDate;
        endDate = _endDate;
        resultsCount = _resultsCount;

        resolvedResult = 255;
    }

    function addResult(uint64 customCoefficient) public {
        require(msg.sender == owner);
        require(state == States.Created);

        possibleResults.push(Result(customCoefficient, 0, 0));

        if (possibleResults.length == resultsCount) {
            state = States.Published;
        }
    }

    // Data mapping:
    //                                uint8 action (0 - deposit/operator's pledge)
    //                 uint8 result | uint8 action (1 - bet)
    // TODO                         | uint8 action (2 - vote)
    // TODO                         | uint8 action (3 - claim)
    function tokenFallback(address _from, uint _value, bytes _data) public {
        uint8 action;
        uint offset = _data.length;

        if (offset == 0) { // Empty data, same as action == 0
            return;
        }

        action = bytesToUint8(offset, _data);
        offset -= 1; // sizeOfUint(8);

        if (action == 0) {
            return;
        } else if (action == 1) { // Bet
            uint8 result;

            result = bytesToUint8(offset, _data);
            offset -= 1; // sizeOfUint(8);

            newBet(result, _value);

        } else if (action == 2) {
            revert(); // Not implemented
        } else if (action == 3) {
            revert(); // Not implemented
        } else {
            revert(); // Invalid action
        }
    }

    function getState() public constant returns (States) {
        if(now < startDate) { // time.checkTime(startDate)
            if(bets.length > 0) {
                return States.Accepted;
            } else {
                return States.Published;
            }
        } else { // now >= startDate
            if(bets.length > 0) {
                if(now < endDate) { // time.checkTime(endDate)
                    return States.Started;
                }

                if(resolvedResult == 255) {
                    return States.Finished;
                }
            }

            // Final check:
            if(token.balanceOf(address(this)) == 0) {
                return States.Distributed;
            } else {
                return States.Closed;
            }
        }
    }

    modifier stateTransitions() {
        state = getState();
        _;
    }

    function newBet(uint8 result, uint256 amount) stateTransitions internal {
        require(state == States.Published || state == States.Accepted);
        require(result >= 0 && result < resultsCount);
        require(now < startDate - (10 minutes));

        bets.push(Bet(now, tx.origin, result, amount));

        possibleResults[result].betCount = uint32(possibleResults[result].betCount.add(1));
        possibleResults[result].betSum = possibleResults[result].betSum.add(amount);

        usersBets[tx.origin].push(bets.length - 1);
        state = States.Accepted;

        bytes memory buffer = new bytes(sizeOfUint(256));
        uintToBytes(sizeOfUint(256), bets.length, buffer);
        base.updated(address(this), buffer);
    }

    function resolve(uint8 result) public stateTransitions {
        require(whitelist.whitelist(msg.sender) == true);
        require(state == States.Finished);
        require(result < resultsCount || result >= 220);

        resolvedResult = result;
        state = States.Closed;

        bytes memory empty;
        base.updated(address(this), empty);
    }

    function getUserBets(address _user) public view returns (uint[]) {
        return usersBets[_user];
    }

    function isOperatorEvent() private pure returns (bool) {
        return false;
    }

    function hasDefinedResult() private constant returns (bool) {
        return resolvedResult < 220;
    }

    function calculateLosersBetSum() private view returns (uint256) {
        uint256 losersBetSum = 0;
        for(uint8 i = 0; i < resultsCount; i++) {
            if(i == resolvedResult) {
                continue;
            }

            losersBetSum += possibleResults[i].betSum;
        }

        return losersBetSum;
    }

    function calculateBetsSum() private view returns (uint256) {
        uint256 betsSum = 0;
        for(uint8 i = 0; i < resultsCount; i++) {
            betsSum = betsSum.add(possibleResults[i].betSum);
        }

        return betsSum;
    }

    function calculateBetsSums() public view returns (uint256, uint256, uint256) { // betSum, winnersBetSum, losersBetSum
        uint256 betsSum = 0;
        uint256 losersBetSum = 0;
        uint256 winnersBetSum = possibleResults[resolvedResult].betSum;

        for(uint8 i = 0; i < resultsCount; i++) {
            betsSum = betsSum.add(possibleResults[i].betSum);

            if(i == resolvedResult) {
                continue;
            }

            losersBetSum = losersBetSum.add(possibleResults[i].betSum);
        }

        return (betsSum, winnersBetSum, losersBetSum);
    }
 
    function getPrize(uint _userBet) public view returns (uint256) {
        if (state != States.Closed) {
            return 0;
        }

        require(_userBet < usersBets[tx.origin].length);

        Bet memory bet = bets[usersBets[tx.origin][_userBet]];

        if (bet.result == resolvedResult) {
            if (isOperatorEvent()) {
                return bet.amount.mul(possibleResults[resolvedResult].customCoefficient);
            } else {
                uint256 betSum;
                uint256 losersBetSum;
                uint256 winnersBetSum;

                (betSum, winnersBetSum, losersBetSum) = calculateBetsSums();

                uint256 coefficient = bet.amount.div(winnersBetSum);
                uint256 prize = bet.amount.mul(99).div(100).add(
                    losersBetSum.mul(99).div(100).mul(coefficient)
                );

                return prize;
            }
        }

        return 0;
    }

    function getRefund(uint _userBet) public view returns (uint256) {
        if (state != States.Closed || hasDefinedResult()) {
            return 0;
        }

        require(_userBet < usersBets[tx.origin].length);

        return bets[usersBets[tx.origin][_userBet]].amount;
    }

    function getEventCreatorReward() public view returns (uint256) {
        if (tx.origin != creator) {
            return 0;
        }

        if (getState() != States.Closed) {
            return 0;
        }

        uint256 betSum = calculateBetsSum();

        // uint256 eventCreatorPercent = betsSum.mul(200); // TODO use this when judging implemented
        uint256 eventCreatorPercent = betSum.div(100);

        if(eventCreatorPercent < deposit) {
            return eventCreatorPercent.add(deposit);
        }

        return deposit.mul(2);
    }

    function getEventCreatorRefund() public view returns (uint256) {
        if (tx.origin != creator) {
            return 0;
        }

        if (getState() != States.Closed || hasDefinedResult()) {
            return 0;
        }

        uint256 betSum = calculateBetsSum();

        if (betSum == 0) {
            return 0;
        }

        return deposit;
    }

    function getShare(address user) public view returns (uint) {
        uint share = 0;

        share = share.add(getEventCreatorReward());
        share = share.add(getEventCreatorRefund());

        uint betsAmount = usersBets[tx.origin].length;

        for(uint i = 0; i < betsAmount; i++) {
            share = share.add(getPrize(i));
            share = share.add(getRefund(i));
        }

        return share;
    }

    // --------------------------------

    mapping(address => uint) public withdraws; // User address => withdrawal timestamp
    uint public lastWithdraw = 0;

    function withdraw() public {
        require(withdraws[msg.sender] == 0, 'Withdraw already done');

        uint256 share = getShare(msg.sender);

        require(share > 0, 'Share should be > 0');

        if (lastWithdraw == 0) {
            // TODO transfer jackpot
        }

        lastWithdraw = now;
        withdraws[msg.sender] = lastWithdraw;

        token.transfer(msg.sender, share);

        bytes memory empty;
        base.updated(address(this), empty);
    }

    mapping(address => mapping(uint => uint)) public betWithdraws; // User address => userBet index => withdrawal timestamp

    function withdrawPrize(uint bet) public {
        require(betWithdraws[msg.sender][bet] == 0);

        uint share = getPrize(bet).add(getRefund(bet));

        require(share > 0);

        lastWithdraw = now;
        withdraws[msg.sender] = lastWithdraw;
        betWithdraws[msg.sender][bet] = lastWithdraw;

        token.transfer(msg.sender, share);

        bytes memory empty;
        base.updated(address(this), empty);
    }

    mapping(address => uint) public rewardWithdraws; // User address => withdrawal timestamp

    function withdrawReward() public {
        require(tx.origin == creator) ;
        require(rewardWithdraws[msg.sender] == 0);

        uint share = hasDefinedResult() ? getEventCreatorReward() : getEventCreatorRefund();

        require(share > 0);

        lastWithdraw = now;
        withdraws[msg.sender] = lastWithdraw;
        rewardWithdraws[msg.sender] = lastWithdraw;

        token.transfer(msg.sender, share);

        bytes memory empty;
        base.updated(address(this), empty);
    }
}
