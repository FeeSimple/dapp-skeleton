const express = require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParser = require('body-parser')
const port = process.env.PORT || 3333
const eos = require('./eoshandler')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

eos.init()

// Input: table
app.post('/table', eos.getTable)

// Input: itemId, itemDesc
app.post('/item/create', eos.createItem)

// Input: itemId
app.post('/item/complete', eos.completeItem)

// Input: itemId
app.post('/item/remove', eos.removeItem)

server.listen(port, function () {
  console.log('Server is listening at port ' + port)
})