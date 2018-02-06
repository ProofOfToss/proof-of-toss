    pragma solidity ^0.4.2;

import "./Token.sol";

contract Event {
    enum Statuses { Published, Accepted, Started, Judging, Finished }

    struct Tag {
        byte2 locale;
        string name;
    }

    struct Result {
        string description;
        ufixed customCooficient;
        unit betCount;
        uint betSum;
    }


    uint constant public meta_version = 1;
    address public creator;
    bool public status = Statuses.Published;
    byte2 public locale;
    byte32 public category;
    Tag[] public tags;
    string public name;
    string public description;
    uint public startDate;
    uint public endDate;
    string public sourceUrl;
    Result[] possibleResults;
    uint createdTimestamp;



    function Event(address _creator, string _name, uint256 deposit, byte2 _locale, byte32 _category, string[] _tags,
        string _name, string _description, uint _startDate, uint _endDate, string _sourceUrl, string[] _possibleResults

    ) {
        creator = _creator;
        name = _name;
        deposit = _deposit;
        locale = _locale;
        category = _category;
        tags = transformTags(_tags);
        name = _name;
        description = _description;
        startDate = _startDate;
        endDate = _endDate;
        sourceUrl = _sourceUrl;
        possibleResults = transformPossibleResults(_possibleResults);
        createdTimestamp = block.timestamp;
    }

    function private transformTags(tags) {
        return tags;
    }

    function private transformPossibleResults(possibleResults) {
        return possibleResults;
    }

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
