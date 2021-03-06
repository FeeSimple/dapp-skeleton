const EOS = require('eosjs')

// Define the account used to deploy the contract.
// This account will be used to reference the contract.
const contractAccount = {
  name: 'usertrung123',
  privKey: '5K6LU8aVpBq9vJsnpCvaHCcyYwzPPKXfDdyefYyAMMs3Qy42fUr'
}

// Define the nodeos endpoint connected to the remote testnet blockchain
// This can be a local nodeos or running directly on the remote testnet
const nodeosEndpoint = 'http://138.197.194.220:8877'

// Basic configuration of the EOS client
const config = {
  chainId: '1c6ae7719a2a3b4ecb19584a30ff510ba1b6ded86e1fd8b8fc22f1179c622a32',
  keyProvider: contractAccount.privKey,
  httpEndpoint: nodeosEndpoint,

  expireInSeconds: 60,
  broadcast: true,
  debug: false, // set to true for debugging the transaction
  sign: true
}

// Instantiate the EOS client used for blockchain/contract interaction
let eosClient

var EosHandler = function () {}

EosHandler.init = function () {
  // Instantiate the EOS client used for blockchain/contract interaction
  eosClient = EOS(config)
  console.log('EosHandler - init')
}

EosHandler.getTable = function (req, res, next) {
  var token = req.headers['feesimple-token']
  // if (token !== 'fst')
  //   return res.status(500).send()

  let tableName = req.body.table
  console.log('EosHandler - getTable: ', tableName)

  // For the first para (named "json"), set to true to receive full JSON-encoded returned result
  eosClient.getTableRows(true, contractAccount.name, contractAccount.name, tableName)
      .then((data) => {
        console.log(data);
        res.send(data.rows)
      })
      .catch((err) => {  
        console.log(err)
        res.send(err)
      })
}

EosHandler.createItem = function (req, res, next) {
  var token = req.headers['feesimple-token']
  // console.log('createItem - headers: ', req.headers);
  if (token !== 'fst')
    return res.status(500).send()

  let itemId = parseInt(req.body.itemId)
  let itemDesc = req.body.itemDesc

  console.log('EosHandler - createItem (id:', itemId, ', description: ', itemDesc, ')')
  eosClient.contract(contractAccount.name).then((contract) => {
    contract.create(
      contractAccount.name,
      itemId,
      itemDesc,
      { authorization: [contractAccount.name] }
    ).then((data) => {  
      console.log(data) 
      res.send(data.transaction_id)
    })
    .catch((err) => {  
      console.log(err)
      res.send(err)
    })
  })
}

EosHandler.completeItem = function (req, res, next) {
  var token = req.headers['feesimple-token']
  if (token !== 'fst')
    return res.status(500).send()

  let itemId = parseInt(req.body.itemId)

  console.log('EosHandler - completeItem (id:', itemId, ')')
  eosClient.contract(contractAccount.name).then((contract) => {
    contract.complete(
      contractAccount.name,
      itemId,
      { authorization: [contractAccount.name] }
    ).then((data) => {  
      console.log(data) 
      res.send(data.transaction_id)
    })
    .catch((err) => {  
      console.log(err)
      res.send(err)
    })
  })
}

EosHandler.removeItem = function (req, res, next) {
  var token = req.headers['feesimple-token']
  if (token !== 'fst')
    return res.status(500).send()

  let itemId = parseInt(req.body.itemId)

  console.log('EosHandler - removeItem (id:', itemId, ')')
  eosClient.contract(contractAccount.name).then((contract) => {
    contract.destroy(
      contractAccount.name,
      itemId,
      { authorization: [contractAccount.name] }
    ).then((data) => {  
      console.log(data) 
      res.send(data.transaction_id)
    })
    .catch((err) => {  
      console.log(err)
      res.send(err)
    })
  })
}

module.exports = EosHandler
