const EOS = require('eosjs')

// Define the account used to deploy the contract.
// This account will be used to reference the contract.
const contractAccount = {
  name: 'useraaaaaaaa',
  privKey: '5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr'
}

// Define the local nodeos endpoint connected to the remote testnet blockchain
const localNodeos = 'http://159.65.109.118:8877'

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
let eosClient

var EosHandler = function () {}

EosHandler.init = function () {
  // Instantiate the EOS client used for blockchain/contract interaction
  eosClient = EOS(config)
  console.log('EosHandler - init')
}

EosHandler.getTable = function (req, res, next) {
  var token = req.headers['feesimple-token']
  if (token !== 'fst')
    return res.status(500).send()

  let tableName = req.body.table
  console.log('EosHandler - getTable: ', tableName)
  eosClient.getTableRows(false, contractAccount.name, contractAccount.name, tableName)
      .then((data) => {
        res.send(data)
      }).catch((e) => {
        console.error(e)
        return res.status(500).send()
      })
}

EosHandler.createItem = function (req, res, next) {
  var token = req.headers['feesimple-token']
  if (token !== 'fst')
    return res.status(500).send()

  let itemId = parseInt(req.body.id)
  let itemDesc = req.body.desc

  console.log('EosHandler - createItem (id:', itemId, ', description: ', itemDesc, ')')
  eosClient.contract(contractAccount.name).then((contract) => {
    contract.create(
      contractAccount.name,
      itemId,
      itemDesc,
      { authorization: [contractAccount.name] }
    ).then((res) => {  console.log(res) })
    .catch((err) => {  console.log(err) })
  })
}

module.exports = EosHandler