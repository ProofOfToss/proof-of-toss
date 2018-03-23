pragma solidity ^0.4.2;

import "./installed_contracts/Seriality/Seriality.sol";
import "./Token.sol";
import "./Whitelist.sol";
import "./ERC223ReceivingContract.sol";

contract EventBase is ERC223ReceivingContract, Seriality {
    // Declare Event contract's fields because fields must match
    EventBase base;
    address public owner;

    // enum States { Created, Published, Accepted, Started, Finished, Resolved, Dispute, Judging, Closed, Distributed } // Full
    enum States { Created, Published, Accepted, Started, Finished, Closed, Distributed } // Simplified

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint64 betSum;
    }

    struct Bet {
        uint timestamp;
        address bettor;
        uint8 result;
        uint64 amount;
    }

    Token public token;
    Whitelist public whitelist;

    address public creator;
    address public operatorId = 1;
    uint64 public deposit;
    uint64 public startDate;
    uint64 public endDate;
    bytes32 public bidType;
    uint8 public resultsCount;

    States public state;
    Result[] public possibleResults;
    Bet[] public bets;
    mapping (address => uint[]) private usersBets;

    uint8 public resolvedResult; // 255 - not set; 254 – different result; 253 – undefined result; 232 – event was canceled; etc ... todo

    uint constant public meta_version = 1;

    function EventBase(address _token) {
        owner = msg.sender;
        token = Token(_token);
    }

    function init(address _token, address _whitelist, address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) public {
        require(msg.sender == owner);
        require(_resultsCount < 220); // 220 - 255 reserved for special results
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

            newBet(result, uint64(_value));

        } else if (action == 2) {
            throw; // Not implemented
        } else if (action == 3) {
            throw; // Not implemented
        } else {
            throw; // Invalid action
        }
    }

    function getState() constant returns (States) {
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

    function newBet(uint8 result, uint64 amount) stateTransitions internal {
        require(state == States.Published || state == States.Accepted);
        require(result >= 0 && result < resultsCount);
        require(now < startDate - (10 minutes));

        bets.push(Bet(now, tx.origin, result, amount));

        possibleResults[result].betCount += 1;
        possibleResults[result].betSum += amount;

        usersBets[tx.origin].push(bets.length - 1);
        state = States.Accepted;
    }

    function resolve(uint8 result) stateTransitions {
        require(whitelist.whitelist(msg.sender) == true);
        require(state == States.Finished);
        require(result < resultsCount || result >= 220);

        resolvedResult = result;
        state = States.Closed;
    }

    function getUserBets() view returns (uint[]) {
        return usersBets[msg.sender];
    }

    function getShare(address user) constant returns (uint256) {
        if (user == creator) {
            return token.balanceOf(address(this));
        } else {
            return 0;
        }
    }

    function withdraw() {
        token.transfer(msg.sender, getShare(msg.sender));
    }
}
