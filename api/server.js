const express = require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParser = require('body-parser')
const port = process.env.PORT || 3333
const eos = require('./eoshandler')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

eos.init()

// Input: tableName
app.post('/table', eos.getTable)

// Input: itemId, itemDesc
app.post('/item/create', eos.createItem)


server.listen(port, function () {
  console.log('Server is listening at port ' + port)
})