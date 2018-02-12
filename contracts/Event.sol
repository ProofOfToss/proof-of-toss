pragma solidity ^0.4.2;

import "./installed_contracts/strings.sol";
import "./installed_contracts/JsmnSolLib.sol";
import "./Token.sol";

contract Event {
    using strings for *;

    Token token;
    enum Statuses { Published, Accepted, Started, Judging, Finished }

    struct Tag {
        string name;
        bytes2 locale;
    }

    struct Result {
        string description;
        uint customCoefficient;
        uint betCount;
        uint betSum;
    }

    uint constant public meta_version = 1;
    address public creator;
    Statuses public status = Statuses.Published;
    bytes2 public locale;
    bytes32 public category;
    string public name;
    uint public deposit;
    string public description;
    uint64 public startDate;
    uint64 public endDate;
    string public sourceUrl;
    uint createdTimestamp;

    Tag[3] public tags;
    Result[3] possibleResults;



    function Event(address _creator, address _token, string _name, uint _deposit, bytes2 _locale, bytes32 _category,
        string _description, uint64 _startDate, uint64 _endDate, string _sourceUrl, string memory _tags
    ) {
        token = Token(_token);
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

        parseTags(_tags);
//        parseResults(_results);
    }

    function parseTags(string _tags) private {
        var tagsSlice = _tags.toSlice();
        var delimiter = ".".toSlice();
        for(uint i = 0; i < 3; i++) {

            if(tagsSlice.len() < 2) break;

            //Convert locale to bytes2
            bytes2 localeBytes2;
            string memory localeString = tagsSlice.split(delimiter).toString();

            assembly {
                localeBytes2 := mload(add(localeString, 2))
            }

            tags[i] = Tag(tagsSlice.split(delimiter).toString(), localeBytes2);
        }
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
