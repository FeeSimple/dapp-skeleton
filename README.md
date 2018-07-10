# dApp backend skeleton

## Introduction

Based on the sample code of https://github.com/eosasia/eos-todo, some needed modification
was made so that the existing code can work with new EOSIO software version.

It demonstrates CRUD operation of data against EOS blochchain via smart contract

### Required versions

* **EOSIO:** `master branch at commit a97a49a0dd4f5051dc7de1de4bc654fedf49cadf`
* **eosjs:** `^14.1.1`

## Javascript code snippet of eosjs library usage for contract/blockchain interaction

```
// Import eosjs
import EOS from 'eosjs'

// Define the account used to deploy the contract.
// This account will be used to reference the contract.
const contractAccount = {
    name: 'useraaaaaaaa',
    privKey: '5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr'
}

// Define the local nodeos endpoint connected to the remote testnet blockchain
const localNodeos = 'http://138.197.194.220:8877'

// Basic configuration of the EOS client
const config = {
    chainId: '1c6ae7719a2a3b4ecb19584a30ff510ba1b6ded86e1fd8b8fc22f1179c622a32',
    keyProvider: contractAccount.privKey,
    httpEndpoint: localNodeos,

    expireInSeconds: 60,
    broadcast: true,
    debug: false, // set to true for debugging the transaction
    sign: true
}

// Instantiate the EOS client used for blockchain/contract interaction
const eosClient = EOS(config)

// Reference the deployed contract (via the account name used to deploy the contract)
// to invokve its method
eosClient.contract(contractAccount.name).then((contract) => {
  contract.create(
    contractAccount.name,
    (id),
    description,
    { authorization: [contractAccount.name] }
  ).then((res) => { this.setState({ loading: false })})
  .catch((err) => { this.setState({ loading: false }); console.log(err) })
})

```

## Source code explanation

### Part 1: frontend

Implemented in ReactJS that provides a web-based frontend.
Via the web UI, it's possible to create new "todo" item or delete the existing "todo" item.

### Part 2: api

Implemented in NodeJS that provides rest APIs for the frontend for contract interaction.
This API layer releases the burden of the EOS-specific handling from the frontend.
Each API implementation is based on the "eosjs" library.

### Part 3: contract

Implement the smart contract functions invoked by the frontend

## Usage

### Deploy contract

General instruction of how to deploy contract can be found right here:
https://github.com/FeeSimple/deploy_contract

Command line for deployment is as follows:

```
cleos --wallet-url http://localhost:6666 --url http://138.197.194.220:8877 set contract useraaaaaaaa path_to_dapp-skeleton_contract_folder path_to_dapp-skeleton_contract_folder/todo.wast path_to_dapp-skeleton_contract_folder/todo.abi
```

* Install with: `npm install`
* Start up with: `npm run start`
* Open `http://localhost:8080/`
* Query on-chain database table: `cleos --wallet-url http://localhost:6666 --url http://138.197.194.220:8877 get table useraaaaaaaa useraaaaaaaa todos`
