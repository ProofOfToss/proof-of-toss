pragma solidity ^0.4.2;

contract Token {
    // Pre-sale tokens transfer

    address owner;

    uint preSaleTransferEnd;
    uint256 icoSoftcap;

    modifier presaleEnded {
        require(msg.sender == owner || (now > preSaleTransferEnd && balanceOf[owner] <= (totalTokens - icoSoftcap)));
        _;
    }

    // ERC20

    string public standard = 'Token 0.1';
    string public name = 'TOSS';                        //!< name for display purporses
    string public symbol = 'TOSS';                      //!< symbol for display purporses
    uint8 public decimals = 8;                          //!< amount of decimals for display purporses

    mapping (address => uint256) public balanceOf;      //!< array of all balances
    mapping (address => mapping (address => uint256)) public allowed;

    uint256 totalTokens;

    function Token(uint _preSaleTransferEnd, uint256 _icoSoftcap) {
        owner = msg.sender;

        preSaleTransferEnd = _preSaleTransferEnd;
        icoSoftcap = _icoSoftcap;

        uint256 initialSupply = 1000000000;
        totalTokens = initialSupply;
        balanceOf[msg.sender] = initialSupply;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event TokenOperationEvent(string operation, address indexed from, address indexed to, uint256 value, address indexed _contract);

    // @brief Send coins
    // @param _to recipient of coins
    // @param _value amount of coins for send
    function transfer(address _to, uint256 _value) presaleEnded {
        if (balanceOf[msg.sender] < _value || _value <= 0) throw;

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
        TokenOperationEvent('transfer', msg.sender, _to, _value, 0);
    }

    // @brief Send coins
    // @param _from source of coins
    // @param _to recipient of coins
    // @param _value amount of coins for send
    function transferFrom(address _from, address _to, uint256 _value) presaleEnded {
        if (balanceOf[_from] < _value || _value <= 0) throw;
        if (allowed[_from][msg.sender] < _value) throw;

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowed[_from][msg.sender] -= _value;

        Transfer(_from, _to, _value);
        TokenOperationEvent('transfer', _from, _to, _value, 0);
    }

    // @brief Allow another contract to spend some tokens in your behalf
    // @param _spender another contract address
    // @param _value amount of approved tokens
    function approve(address _spender, uint256 _value) presaleEnded {
        allowed[msg.sender][_spender] = _value;

        TokenOperationEvent('approve', msg.sender, _spender, _value, 0);
    }

    // @brief Get allowed amount of tokens
    // @param _owner owner of allowance
    // @param _spender spender contract
    // @return the rest of allowed tokens
    function allowance(address _owner, address _spender) constant returns (uint256 remaining)  {
        return allowed[_owner][_spender];
    }

    // Proof of TOSS

    mapping (address => mapping (address => bool)) public grantedToAllowBlocking; // Address of smart contract that can allow other contracts to block tokens
    mapping (address => mapping (address => bool)) public allowedToBlocking; // Address of smart contract that can block tokens
    mapping (address => mapping (address => uint256)) public blocked; // Blocked tokens

    // @brief Allow another contract to allow another contract to block tokens. Can be revoked
    // @param _spender another contract address
    // @param _value amount of approved tokens
    function grantToAllowBlocking(address _contract, bool permission) {
        uint codeLength;

        assembly { // Retrieve the size of the code on target address, this needs assembly .
            codeLength := extcodesize(_contract)
        }

        if (codeLength <= 0) throw; // Only smart contracts allowed

        grantedToAllowBlocking[msg.sender][_contract] = permission;

        TokenOperationEvent('grant_allow_blocking', msg.sender, _contract, 0, 0);
    }

    // @brief Allow another contract to block tokens. Can't be revoked
    // @param _owner tokens owner
    // @param _contract another contract address
    function allowBlocking(address _owner, address _contract) {
        uint codeLength;

        assembly { // Retrieve the size of the code on target address, this needs assembly .
            codeLength := extcodesize(_contract)
        }

        if (codeLength <= 0) throw; // Only smart contracts allowed
        if (_contract == msg.sender) throw;
        if (_contract == _owner) throw;
        if (! grantedToAllowBlocking[_owner][msg.sender]) throw;

        allowedToBlocking[_owner][_contract] = true;

        TokenOperationEvent('allow_blocking', _owner, _contract, 0, msg.sender);
    }

    // @brief Check if contract is granted to allow blocking to other contracts
    // @param _owner owner of allowance
    // @param _spender spender contract
    // @return the rest of allowed tokens
    function allowanceToAllowBlocking(address _owner, address _contract) constant returns (bool granted) {
        return grantedToAllowBlocking[_owner][_contract];
    }

    // @brief Blocks tokens
    // @param _blocking The address of tokens which are being blocked
    // @param _value The blocked token count
    function block(address _blocking, uint256 _value) presaleEnded {
        if (! allowedToBlocking[_blocking][msg.sender]) throw;
        if (balanceOf[_blocking] < _value || _value <= 0) throw;

        balanceOf[_blocking] -= _value;
        blocked[_blocking][msg.sender] += _value;

        TokenOperationEvent('block', _blocking, 0, _value, msg.sender);
    }

    // @brief Unblocks tokens and sends them to the given address (to _unblockTo)
    // @param _blocking The address of tokens which are blocked
    // @param _unblockTo The address to send to the blocked tokens after unblocking
    // @param _value The blocked token count to unblock
    function unblock(address _blocking, address _unblockTo, uint256 _value) presaleEnded {
        if (blocked[_blocking][msg.sender] == 0) throw;
        if (! allowedToBlocking[_blocking][msg.sender]) throw;
        if (blocked[_blocking][msg.sender] < _value) throw;

        blocked[_blocking][msg.sender] -= _value;
        balanceOf[_unblockTo] += _value;

        TokenOperationEvent('unblock', _blocking, _unblockTo, _value, msg.sender);
    }

    // Testing

    function generateTokens(address _user, uint256 _value) {
        balanceOf[_user] += _value;
    }
}
