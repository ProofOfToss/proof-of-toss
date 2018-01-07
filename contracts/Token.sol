pragma solidity ^0.4.2;

contract Token {
    string public standard = 'Token 0.1';
    string public name = 'TOSS';                        //!< name for display purporses
    string public symbol = 'TOSS';                      //!< symbol for display purporses
    uint8 public decimals = 8;                          //!< amount of decimals for display purporses

    mapping (address => uint256) public balanceOf;      //!< array of all balances
    mapping (address => mapping (address => uint256)) public allowed;
    mapping (address => mapping (address => uint256)) public blocked;

    uint256 totalTokens;

    function Token() {
        uint256 initialSupply = 1000000000;
        totalTokens = initialSupply;
        balanceOf[msg.sender] = initialSupply;
    }

    // @brief Send coins
    // @param _to recipient of coins
    // @param _value amount of coins for send
    function transfer(address _to, uint256 _value) {
        if (balanceOf[msg.sender] < _value || _value <= 0) throw;

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
    }

    // @brief Send coins
    // @param _from source of coins
    // @param _to recipient of coins
    // @param _value amount of coins for send
    function transferFrom(address _from, address _to, uint256 _value) {
        if (balanceOf[_from] < _value || _value <= 0) throw;
        if (allowed[_from][msg.sender] < _value) throw;

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowed[_from][msg.sender] -= _value;
    }

    // @brief Allow another contract to spend some tokens in your behalf
    // @param _spender another contract address
    // @param _value amount of approved tokens
    function approve(address _spender, uint256 _value) {
        allowed[msg.sender][_spender] = _value;
    }

    // @brief Get allowed amount of tokens
    // @param _owner owner of allowance
    // @param _spender spender contract
    // @return the rest of allowed tokens
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function block(address _blocking, uint256 _value) {
        if (_blocking == msg.sender) throw;
        if (allowed[_blocking][msg.sender] < _value) throw;
        if (balanceOf[msg.sender] < _value || _value <= 0) throw;

        balanceOf[_blocking] -= _value;
        blocked[_blocking][msg.sender] += _value;
    }

    function unblock(address _blocking, address _unblockTo, uint256 _value) {
        if (blocked[_blocking][msg.sender] == 0) throw;
        if (blocked[_blocking][msg.sender] < _value) throw;

        delete blocked[_blocking][msg.sender];
        balanceOf[_unblockTo] += _value;
    }

    function generateTokens(address _user, uint256 _value) {
        balanceOf[_user] += _value;
    }
}
