from web3 import Web3, HTTPProvider
import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
import time
import json
import requests

abi = [{'constant': True,
  'inputs': [],
  'name': 'name',
  'outputs': [{'name': '', 'type': 'string'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_spender', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'approve',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '_beneficiary', 'type': 'address'}],
  'name': 'freezedTokenOf',
  'outputs': [{'name': 'amount', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '', 'type': 'address'}],
  'name': 'grantedToSetUnpausedWallet',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'totalSupply',
  'outputs': [{'name': '', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '', 'type': 'address'}, {'name': '', 'type': 'address'}],
  'name': 'allowedToBlocking',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '', 'type': 'address'}, {'name': '', 'type': 'address'}],
  'name': 'blocked',
  'outputs': [{'name': '', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_to', 'type': 'address'},
   {'name': 'permission', 'type': 'bool'}],
  'name': 'grantToSetUnpausedWallet',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_from', 'type': 'address'},
   {'name': '_to', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'transferFrom',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'decimals',
  'outputs': [{'name': '', 'type': 'uint8'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_blocking', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'blockTokens',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_to', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'},
   {'name': '_data', 'type': 'bytes'}],
  'name': 'transferToContract',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_to', 'type': 'address'},
   {'name': '_amount', 'type': 'uint256'}],
  'name': 'mint',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_blocking', 'type': 'address'},
   {'name': '_unblockTo', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'unblockTokens',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '_beneficiary', 'type': 'address'}],
  'name': 'defrostDate',
  'outputs': [{'name': 'Date', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'paused',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '', 'type': 'address'}, {'name': '', 'type': 'address'}],
  'name': 'grantedToAllowBlocking',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_spender', 'type': 'address'},
   {'name': '_subtractedValue', 'type': 'uint256'}],
  'name': 'decreaseApproval',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_holders', 'type': 'address[]'}],
  'name': 'migrateAll',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '_owner', 'type': 'address'}],
  'name': 'balanceOf',
  'outputs': [{'name': 'balance', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_migrationAgent', 'type': 'address'}],
  'name': 'setMigrationAgent',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'migrationAgent',
  'outputs': [{'name': '', 'type': 'address'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_to', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'},
   {'name': '_when', 'type': 'uint256'}],
  'name': 'transferAndFreeze',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'owner',
  'outputs': [{'name': '', 'type': 'address'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [],
  'name': 'migrate',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'totalMigrated',
  'outputs': [{'name': '', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': True,
  'inputs': [],
  'name': 'symbol',
  'outputs': [{'name': '', 'type': 'string'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_beneficiary', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'burn',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_to', 'type': 'address'},
   {'name': '_value', 'type': 'uint256'}],
  'name': 'transfer',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_wallet', 'type': 'address'},
   {'name': 'mode', 'type': 'bool'}],
  'name': 'setUnpausedWallet',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_owner', 'type': 'address'},
   {'name': '_contract', 'type': 'address'}],
  'name': 'allowBlocking',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '', 'type': 'address'}],
  'name': 'unpausedWallet',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_contract', 'type': 'address'},
   {'name': 'permission', 'type': 'bool'}],
  'name': 'grantToAllowBlocking',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': 'mode', 'type': 'bool'}],
  'name': 'setPause',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_spender', 'type': 'address'},
   {'name': '_addedValue', 'type': 'uint256'}],
  'name': 'increaseApproval',
  'outputs': [{'name': '', 'type': 'bool'}],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': True,
  'inputs': [{'name': '_owner', 'type': 'address'},
   {'name': '_spender', 'type': 'address'}],
  'name': 'allowance',
  'outputs': [{'name': '', 'type': 'uint256'}],
  'payable': False,
  'stateMutability': 'view',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': 'newOwner', 'type': 'address'}],
  'name': 'transferOwnership',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'constant': False,
  'inputs': [{'name': '_beneficiary', 'type': 'address'},
   {'name': '_amount', 'type': 'uint256'},
   {'name': '_when', 'type': 'uint256'}],
  'name': 'freezeTokens',
  'outputs': [],
  'payable': False,
  'stateMutability': 'nonpayable',
  'type': 'function'},
 {'anonymous': False,
  'inputs': [{'indexed': False, 'name': 'operation', 'type': 'string'},
   {'indexed': True, 'name': 'from', 'type': 'address'},
   {'indexed': True, 'name': 'to', 'type': 'address'},
   {'indexed': False, 'name': 'value', 'type': 'uint256'},
   {'indexed': True, 'name': '_contract', 'type': 'address'}],
  'name': 'TokenOperationEvent',
  'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': 'burner', 'type': 'address'},
   {'indexed': False, 'name': 'value', 'type': 'uint256'}],
  'name': 'Burn',
  'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': '_from', 'type': 'address'},
   {'indexed': True, 'name': '_to', 'type': 'address'},
   {'indexed': False, 'name': '_value', 'type': 'uint256'}],
  'name': 'Migrate',
  'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': 'to', 'type': 'address'},
   {'indexed': False, 'name': 'amount', 'type': 'uint256'}],
  'name': 'Mint',
  'type': 'event'},
 {'anonymous': False, 'inputs': [], 'name': 'MintFinished', 'type': 'event'},
 {'anonymous': False, 'inputs': [], 'name': 'Pause', 'type': 'event'},
 {'anonymous': False, 'inputs': [], 'name': 'Unpause', 'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': 'previousOwner', 'type': 'address'},
   {'indexed': True, 'name': 'newOwner', 'type': 'address'}],
  'name': 'OwnershipTransferred',
  'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': 'owner', 'type': 'address'},
   {'indexed': True, 'name': 'spender', 'type': 'address'},
   {'indexed': False, 'name': 'value', 'type': 'uint256'}],
  'name': 'Approval',
  'type': 'event'},
 {'anonymous': False,
  'inputs': [{'indexed': True, 'name': 'from', 'type': 'address'},
   {'indexed': True, 'name': 'to', 'type': 'address'},
   {'indexed': False, 'name': 'value', 'type': 'uint256'}],
  'name': 'Transfer',
  'type': 'event'}]

binary = '60806040526001600560006101000a81548160ff02191690831515021790555033600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550613fa88061006f6000396000f3006080604052600436106101d8576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146101dd578063095ea7b31461026d57806311cfb19d146102d257806317221e2c1461032957806318160ddd146103845780631b0a7774146103af5780631d67ef251461042a57806320ceb536146104a157806323b872dd146104f0578063313ce567146105755780633c1a88d7146105a65780633f35d033146105f357806340c10f191461069e57806347b27b8b1461070357806350bb117a146107705780635c975abb146107c75780636093e22a146107f65780636618846314610871578063680b3bdf146108d657806370a082311461093c57806375e2ff65146109935780638328dbcd146109d6578063852e9f4614610a2d5780638da5cb5b14610a845780638fd3ab8014610adb57806395a0f5eb14610af257806395d89b4114610b1d5780639dc29fac14610bad578063a9059cbb14610bfa578063b3e1f52314610c5f578063b58e521614610cae578063b8b3db4f14610d11578063ba8ad39e14610d6c578063bedb86fb14610dbb578063d73dd62314610dea578063dd62ed3e14610e4f578063f2fde38b14610ec6578063f831ebab14610f09575b600080fd5b3480156101e957600080fd5b506101f2610f60565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610232578082015181840152602081019050610217565b50505050905090810190601f16801561025f5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561027957600080fd5b506102b8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610f99565b604051808215151515815260200191505060405180910390f35b3480156102de57600080fd5b50610313600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061108b565b6040518082815260200191505060405180910390f35b34801561033557600080fd5b5061036a600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506110f2565b604051808215151515815260200191505060405180910390f35b34801561039057600080fd5b50610399611112565b6040518082815260200191505060405180910390f35b3480156103bb57600080fd5b50610410600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061111c565b604051808215151515815260200191505060405180910390f35b34801561043657600080fd5b5061048b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061114b565b6040518082815260200191505060405180910390f35b3480156104ad57600080fd5b506104ee600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611170565b005b3480156104fc57600080fd5b5061055b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611337565b604051808215151515815260200191505060405180910390f35b34801561058157600080fd5b5061058a61137e565b604051808260ff1660ff16815260200191505060405180910390f35b3480156105b257600080fd5b506105f1600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611383565b005b3480156105ff57600080fd5b50610684600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091929192905050506117c7565b604051808215151515815260200191505060405180910390f35b3480156106aa57600080fd5b506106e9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611924565b604051808215151515815260200191505060405180910390f35b34801561070f57600080fd5b5061076e600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611aee565b005b34801561077c57600080fd5b506107b1600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061203d565b6040518082815260200191505060405180910390f35b3480156107d357600080fd5b506107dc6120a4565b604051808215151515815260200191505060405180910390f35b34801561080257600080fd5b50610857600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506120b7565b604051808215151515815260200191505060405180910390f35b34801561087d57600080fd5b506108bc600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506120e6565b604051808215151515815260200191505060405180910390f35b3480156108e257600080fd5b5061093a60048036038101908080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050612377565b005b34801561094857600080fd5b5061097d600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612414565b6040518082815260200191505060405180910390f35b34801561099f57600080fd5b506109d4600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061245c565b005b3480156109e257600080fd5b506109eb612543565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b348015610a3957600080fd5b50610a82600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190929190505050612569565b005b348015610a9057600080fd5b50610a9961265d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b348015610ae757600080fd5b50610af0612683565b005b348015610afe57600080fd5b50610b076126db565b6040518082815260200191505060405180910390f35b348015610b2957600080fd5b50610b326126e1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610b72578082015181840152602081019050610b57565b50505050905090810190601f168015610b9f5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b348015610bb957600080fd5b50610bf8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061271a565b005b348015610c0657600080fd5b50610c45600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050612929565b604051808215151515815260200191505060405180910390f35b348015610c6b57600080fd5b50610cac600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080351515906020019092919050505061296e565b005b348015610cba57600080fd5b50610d0f600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612b89565b005b348015610d1d57600080fd5b50610d52600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612e1a565b604051808215151515815260200191505060405180910390f35b348015610d7857600080fd5b50610db9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050612e3a565b005b348015610dc757600080fd5b50610de8600480360381019080803515159060200190929190505050612f8b565b005b348015610df657600080fd5b50610e35600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506130b8565b604051808215151515815260200191505060405180910390f35b348015610e5b57600080fd5b50610eb0600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506132b4565b6040518082815260200191505060405180910390f35b348015610ed257600080fd5b50610f07600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061333b565b005b348015610f1557600080fd5b50610f5e600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190929190505050613493565b005b6040805190810160405280600481526020017f544f53530000000000000000000000000000000000000000000000000000000081525081565b600081600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b600080600760008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905042816001015410156110e457600091506110ec565b806000015491505b50919050565b60066020528060005260406000206000915054906101000a900460ff1681565b6000600154905090565b600b6020528160005260406000206020528060005260406000206000915091509054906101000a900460ff1681565b600c602052816000526040600020602052806000526040600020600091509150505481565b3373ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614806112d15750600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637ad71f726002600981111561121257fe5b6040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808260ff168152602001915050602060405180830381600087803b15801561126757600080fd5b505af115801561127b573d6000803e3d6000fd5b505050506040513d602081101561129157600080fd5b810190808051906020019092919050505073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b15156112dc57600080fd5b80600660008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6000611354826113468661108b565b61354a90919063ffffffff16565b61135d85612414565b1015151561136a57600080fd5b611375848484613568565b90509392505050565b601281565b81600560009054906101000a900460ff1615806113e95750600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b8061143d5750600460008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b151561144857600080fd5b600b60008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1615156114dd57600080fd5b6114f8826114ea8561108b565b61354a90919063ffffffff16565b61150184612414565b1015801561150f5750600082115b151561151a57600080fd5b61156b826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061163c82600c60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b600c60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a33373ffffffffffffffffffffffffffffffffffffffff1660008473ffffffffffffffffffffffffffffffffffffffff167f9b56fa31e6a762f0fbec5f6102fd26a9d0c578481150835eed4ad0c037eb7e95856040518080602001838152602001828103825260058152602001807f626c6f636b0000000000000000000000000000000000000000000000000000008152506020019250505060405180910390a4505050565b600080846000813b90506000811115156117e057600080fd5b6117ea8787612929565b508692508273ffffffffffffffffffffffffffffffffffffffff1663c0ee0b8a3388886040518463ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156118b0578082015181840152602081019050611895565b50505050905090810190601f1680156118dd5780820380516001836020036101000a031916815260200191505b50945050505050600060405180830381600087803b1580156118fe57600080fd5b505af1158015611912573d6000803e3d6000fd5b50505050600193505050509392505050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561198257600080fd5b6119978260015461354a90919063ffffffff16565b6001819055506119ee826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff167f0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885836040518082815260200191505060405180910390a28273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905092915050565b81600560009054906101000a900460ff161580611b545750600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b80611ba85750600460008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b1515611bb357600080fd5b600b60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515611c4857600080fd5b81600c60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410158015611cd45750600082115b1515611cdf57600080fd5b611d6e82600c60008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b600c60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611e3f826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a38273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141515611f82578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a35b3373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167f9b56fa31e6a762f0fbec5f6102fd26a9d0c578481150835eed4ad0c037eb7e95856040518080602001838152602001828103825260078152602001807f756e626c6f636b000000000000000000000000000000000000000000000000008152506020019250505060405180910390a450505050565b600080600760008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090504281600101541015612096576000915061209e565b806001015491505b50919050565b600560009054906101000a900460ff1681565b600a6020528160005260406000206020528060005260406000206000915091509054906101000a900460ff1681565b600080600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050808311156121f7576000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061228b565b61220a838261364490919063ffffffff16565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546040518082815260200191505060405180910390a3600191505092915050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156123d557600080fd5b600090505b81518110156124105761240382828151811015156123f457fe5b9060200190602002015161365d565b80806001019150506123da565b5050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156124b857600080fd5b6000600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156124ff57600080fd5b80600960006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1615156125c357600080fd5b600082111561264c57600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905061262483826000015461354a90919063ffffffff16565b81600001819055508181600101541161263d5781612643565b80600101545b81600101819055505b6126568484612929565b5050505050565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541115156126d057600080fd5b6126d93361365d565b565b60085481565b6040805190810160405280600d81526020017f50524f4f46204f4620544f53530000000000000000000000000000000000000081525081565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561277657600080fd5b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205481111515156127c357600080fd5b612814816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061286b8160015461364490919063ffffffff16565b6001819055508173ffffffffffffffffffffffffffffffffffffffff167fcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5826040518082815260200191505060405180910390a2600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b6000612946826129383361108b565b61354a90919063ffffffff16565b61294f33612414565b1015151561295c57600080fd5b61296683836138c9565b905092915050565b3373ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161480612a135750600660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b80612b235750600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637ad71f7260026009811115612a6457fe5b6040518263ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808260ff168152602001915050602060405180830381600087803b158015612ab957600080fd5b505af1158015612acd573d6000803e3d6000fd5b505050506040513d6020811015612ae357600080fd5b810190808051906020019092919050505073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b1515612b2e57600080fd5b80600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b806000813b9050600081111515612b9f57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614158015612c295750600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614155b1515612c3457600080fd5b600a60008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515612cc957600080fd5b6001600b60008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055503373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167f9b56fa31e6a762f0fbec5f6102fd26a9d0c578481150835eed4ad0c037eb7e95600060405180806020018381526020018281038252600e8152602001807f616c6c6f775f626c6f636b696e670000000000000000000000000000000000008152506020019250505060405180910390a450505050565b60046020528060005260406000206000915054906101000a900460ff1681565b816000813b9050600081111515612e5057600080fd5b82600a60003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555060008473ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f9b56fa31e6a762f0fbec5f6102fd26a9d0c578481150835eed4ad0c037eb7e9560006040518080602001838152602001828103825260148152602001807f6772616e745f616c6c6f775f626c6f636b696e670000000000000000000000008152506020019250505060405180910390a450505050565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515612fe757600080fd5b600560009054906101000a900460ff161580156130015750805b1561304e576001600560006101000a81548160ff0219169083151502179055507f6985a02210a168e66602d3235cb6db0e70f92b3ba4d376a33c0f3d9434bff62560405160405180910390a15b600560009054906101000a900460ff168015613068575080155b156130b5576000600560006101000a81548160ff0219169083151502179055507f7805862f689e2f13df9f062ff482ad3ad112aca9e0847911ed832e158c525b3360405160405180910390a15b50565b600061314982600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546040518082815260200191505060405180910390a36001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561339757600080fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141515156133d357600080fd5b8073ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156134f157600080fd5b600760008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905082816000018190555081816001018190555050505050565b600080828401905083811015151561355e57fe5b8091505092915050565b600082600560009054906101000a900460ff1615806135d05750600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b806136245750600460008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b151561362f57600080fd5b61363a8585856139a3565b9150509392505050565b600082821115151561365257fe5b818303905092915050565b600080600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515156136a657600080fd5b6000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905060008060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506137408160015461364490919063ffffffff16565b60018190555061375b8160085461354a90919063ffffffff16565b600881905550600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16637a3130e383836040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050600060405180830381600087803b15801561382657600080fd5b505af115801561383a573d6000803e3d6000fd5b50505050600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f18df02dcc52b9c494f391df09661519c0069bd8540141946280399408205ca1a836040518082815260200191505060405180910390a35050565b600082600560009054906101000a900460ff1615806139315750600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b806139855750600460008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b151561399057600080fd5b61399a8484613d5d565b91505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141515156139e057600080fd5b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211151515613a2d57600080fd5b600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211151515613ab857600080fd5b613b09826000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b6000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613b9c826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613c6d82600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3600190509392505050565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614151515613d9a57600080fd5b6000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211151515613de757600080fd5b613e38826000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461364490919063ffffffff16565b6000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613ecb826000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461354a90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a360019050929150505600a165627a7a7230582090e3e149ade778d5fddc60e4ef39a5578f75a6924c2b49e4796eb7335e9f43560029'


def lambda_handler(event, context):
    if 'account' not in event or 'sum' not in event or event['account'] is None or event['sum'] is None:
        raise Exception('Invalid argument')

    if 'token_address' not in event or event['token_address'] is None:
        raise Exception('Invalid argument')

    if os.environ['CHECK_CAPTCHA']:
        if 'captchaResponse' not in event or event['captchaResponse'] is None:
            raise Exception('Invalid argument')

        url = "https://www.google.com/recaptcha/api/siteverify"
        params = {
            'secret': os.environ['RECAPTCHA_PRIVKEY'],
            'response': event['captchaResponse'],
        }
        verify_rs = requests.get(url, params=params, verify=True)
        verify_rs = verify_rs.json()

        if not verify_rs.get("success", False):
            raise Exception('Invalid recaptcha: {}'.format(verify_rs.get('error-codes', None) or "Unspecified error."))

    private_key = os.environ['PRIVATE_KEY']
    wallet = os.environ['WALLET']
    server = os.environ['SERVER']

    w3 = Web3(HTTPProvider(server))

    address = w3.toChecksumAddress(event['account'])

    table = boto3.resource('dynamodb').Table(event['table_name'])

    try:
        response = table.get_item(
            Key={
                'address': address,
            }
        )
    except ClientError as e:
        raise Exception('Dynamodb exception: {}'.format(e.response['Error']['Message']))
    else:
        item_exists = 'Item' in response
        item = response['Item'] if item_exists else {'last_request': 0}

    now = int(round(time.time() * 1000))
    day_ago = now - 24 * 60 * 60 * 1000

    if int(item['last_request']) > day_ago:
        raise Exception('Address already used today')


    token = w3.eth.contract(address=w3.toChecksumAddress(event['token_address']), abi=abi, bytecode=binary)
    
    nonce = w3.eth.getTransactionCount(wallet)
    txn = token.functions.mint(w3.toChecksumAddress(event['account']), int(event['sum'])).buildTransaction({
        'nonce': nonce, 
        'gas': 500000,
        'gasPrice': 1,
    })
    signed_txn = w3.eth.account.signTransaction(txn, private_key=private_key)
    tx_hash = w3.eth.sendRawTransaction(signed_txn.rawTransaction)

    txn_sbtc = {
        'nonce': nonce + 1,
        'gas': 500000,
        'gasPrice': 1,
        'to': w3.toChecksumAddress(event['account']),
        'value': 100000000000000,
        'data': w3.toBytes(text='from faucet'),
    }
    signed_txn_sbtc = w3.eth.account.signTransaction(txn_sbtc, private_key=private_key)
    tx_hash_sbtc = w3.eth.sendRawTransaction(signed_txn_sbtc.rawTransaction)

    # Display the new greeting value
    print('Tx sent: {} / {}'.format(
        w3.toHex(w3.sha3(signed_txn.rawTransaction)),
        w3.toHex(w3.sha3(signed_txn_sbtc.rawTransaction)),
    ))
    
    # Wait for transaction to be mined...
    #w3.eth.waitForTransactionReceipt(tx_hash)
    
    # Display the new greeting value
    #print('Updated token pause: {}'.format(
    #   token.functions.paused().call()
    #))


    if item_exists:
        response = table.update_item(
            Key={
                'address': address,
            },
            UpdateExpression="set last_request=:lr",
            ExpressionAttributeValues={
                ':lr': now,
            },
            ReturnValues="UPDATED_NEW"
        )
    else:
        response = table.put_item(
            Item={
                'address': address,
                'last_request': now,
            }
        )

    return {
        'toss': w3.toHex(w3.sha3(signed_txn.rawTransaction)),
        'sbtc': w3.toHex(w3.sha3(signed_txn_sbtc.rawTransaction))
    }

