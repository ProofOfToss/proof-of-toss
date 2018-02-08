pragma solidity ^0.4.2;

import "./Token.sol";

contract Event {
    Token token;
    enum Statuses { Published, Accepted, Started, Judging, Finished }

    struct Tag {
        string name;
        bytes2 locale;
    }

    struct Result {
        string description;
        ufixed customCoefficient;
        uint betCount;
        uint betSum;
    }

    uint constant public meta_version = 1;
    address public creator;
    Statuses public status = Statuses.Published;
    bytes2 public locale;
    bytes32 public category;
//    Tag[] public tags;
    string public name;
    uint public deposit;
    string public description;
    uint64 public startDate;
    uint64 public endDate;
    string public sourceUrl;
//    Result[] possibleResults;
    uint createdTimestamp;



    function Event(address _creator, string _name, uint _deposit, bytes2 _locale, bytes32 _category,
        string _description, uint64 _startDate, uint64 _endDate, string _sourceUrl
    ) {
        creator = _creator;
        name = _name;
        deposit = _deposit;
        locale = _locale;
        category = _category;
        description = _description;
        startDate = _startDate;
        endDate = _endDate;
        sourceUrl = _sourceUrl;
        createdTimestamp = block.timestamp;

//        transformTags(_tags);
//        transformPossibleResults(_possibleResults);
    }

//    function transformTags(string[] _tags) private {
//        for(uint i = 0; i < _tags.length / 2; i++) {
//            tags.push(Tag(_tags[i * 2], _tags[i * 2 + 1]));
//        }
//    }
//
//    function transformPossibleResults(string[] _possibleResults) private {
//        for(uint i = 0; i < _possibleResults.length / 4; i++) {
//            possibleResults.push(Result(_possibleResults[i * 2], ufixed(_possibleResults[i * 2 + 1]),
//                uint(_possibleResults[i * 2 + 2]), uint(_possibleResults[i * 2 + 3])));
//        }
//    }

    function getToken() constant returns (address) {
        return address(token);
    }

    function getCreator() constant returns (address) {
        return creator;
    }

    function getName() constant returns (string) {
        return name;
    }

    function getCreatedTimestamp() constant returns (uint) {
        return createdTimestamp;
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
