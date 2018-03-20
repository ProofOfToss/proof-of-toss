pragma solidity ^0.4.2;

import "./installed_contracts/Seriality/Seriality.sol";
import "./Token.sol";
import "./ERC223ReceivingContract.sol";

contract EventBase is ERC223ReceivingContract, Seriality {
    // Declare Event contract's fields because fields must match
    EventBase base;
    address public owner;

    enum Statuses { Created, Published, Accepted, Started, Judging, Finished }

    struct Result {
        uint64 customCoefficient;
        uint32 betCount;
        uint64 betSum;
    }

    Token public token;

    address public creator;
    uint64 public deposit;
    uint64 public startDate;
    uint64 public endDate;
    bytes32 public bidType;
    uint8 public resultsCount;

    Statuses public status;
    Result[] public possibleResults;

    uint constant public meta_version = 1;

    function EventBase(address _token) {
        owner = msg.sender;
        token = Token(_token);
    }

    function init(address _token, address _creator, uint64 _deposit, uint64 _startDate, uint64 _endDate, uint8 _resultsCount) public {
        require(msg.sender == owner);

        token = Token(_token);

        creator = _creator;
        deposit = _deposit;
        startDate = _startDate;
        endDate = _endDate;
        resultsCount = _resultsCount;
    }

    function addResult(uint64 customCoefficient) public {
        require(msg.sender == owner);

        possibleResults.push(Result(customCoefficient, 0, 0));

        if (possibleResults.length == resultsCount) {
            status = Statuses.Published;
        }
    }

    function tokenFallback(address _from, uint _value, bytes _data) {

    }

    function getShare(address user) constant returns (uint256) {
        if (user == creator) {
            return token.balanceOf(address(this));
        } else {
            return 0;
        }
    }

    function withdraw() {
        bytes memory empty;
        token.transfer(msg.sender, getShare(msg.sender), empty);
    }
}
