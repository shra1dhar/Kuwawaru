// This file works as a node

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');    // creates unique random strings for us


const nodeAddress = uuid().split("-").join(""); //removing dashes for unique string

// Instance of Blockchain
const bitcoin = new Blockchain();


// If req comes in with json data then parse it to access these routes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
 
// Get the Blockchain
app.get('/blockchain', (req, res) => {
   res.send(bitcoin);
});

// Were supposed to send data to this end point
app.post('/transaction', (req, res) => {

   // create newTransaction returns to us the block number to which our new transaction wil be added to.
   // req.body is the body which we are sending to this endpoint using post request.
   const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
   res.json({ note: `Transaction will be added in block ${blockIndex}.` });   // used backstick quotes and not normal quotes. 
});

app.get('/mine', (req, res) => {

   // getting the last block
   const lastBlock = bitcoin.getLastBlock();

   // taking its hash as parameter
   const previousBlockHash = lastBlock['hash'];

   const currentBlockData = {
      transactions: bitcoin.pendingTransaction,
      index: lastBlock['index'] + 1
   };

   const nounce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
   const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nounce);

   // sending reward to whosoever sucessfully mined a block
   // currently in bitcoin reward for mining a block is 12.5 Bitcoin, so we kept the reward same here
   // we have kept the sending address as "00". So whenever there will be a transaction from "00", we will know that it is a reward.
   bitcoin.createNewTransaction(12.5, "00", nodeAddress);

   const newBlock = bitcoin.createNewBlock(nounce, previousBlockHash, blockHash);

   // sending response to whosoever mined this block
   res.json({
      "note": "New Block mined sucessfully",
      block: newBlock
   })
});

app.listen(3000, () => console.log('Listening to port 3000...'));