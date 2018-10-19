// This file works as a node
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');    // creates unique random strings for us
const port = process.argv[2];       // in packet.json, at index 2 is port 3001
const rp = require('request-promise'); //install both request and request-promise library to work with it.


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

   // during broadcast we will hit this end point
   //sending new transaction as data here and adding it to the pendingTransaction array.
   const newTransaction = req.body;
   const blockIndex = bitcoin.addTransactionToPendingTransacions(newTransaction);
   res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

app.post('/transaction/broadcast', (req, res) => {
      const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
      bitcoin.addTransactionToPendingTransacions(newTransaction);

      // broadcast
      const requestPromises = [];
      bitcoin.networkNodes.forEach(networkNodeUrl => {
            const requestOptions = {
                  uri: networkNodeUrl + '/transaction',
                  method: 'POST',
                  body: newTransaction,
                  json:true
            };
            requestPromises.push(rp(requestOptions));
      });

      //run all requests
      Promise.all(requestPromises)
      .then(data => {
            res.json({ note: "transaction created and braoadcast successfully"});
      });
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
//    bitcoin.createNewTransaction(12.5, "00", nodeAddress);
                  // the mabove method was removed and placed somewhere else

   const newBlock = bitcoin.createNewBlock(nounce, previousBlockHash, blockHash);

   const requestPromises = [];
   bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock }, // the block newly created
            json: true
      };

      requestPromises.push(rp(requestOptions))
   });

   Promise.all(requestPromises)
   .then(data => {
      const requestOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                  amount: 12.5,
                  sender: "00",
                  recipient: nodeAddress
            },
            json: true
      };      

      return rp(requestOptions);
   })

   .then(data => {
      // sending response to whosoever mined this block
      res.json({
            note: "New Block mined and broadcasted successfully",
            block: newBlock
      });   
   });
});

// register a new node and broadcast it to the network
app.post('/register-and-broadcast-node', (req, res) => {
   const newNodeUrl = req.body.newNodeUrl;
   if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1)      // if the newNodeUrl isn't already present in the array
      bitcoin.networkNodes.push(newNodeUrl);                // add it in the array

   //array of promises
   const regNodesPromises = []; 
   bitcoin.networkNodes.forEach(networkNodeUrl => {
      // register node
      // we have to make request to every other node. We will use request-promise dependency to do that.
      const requestOptions = {
         uri: networkNodeUrl + '/register-node',
         method: 'POST',
         body: { newNodeUrl: newNodeUrl },
         json: true
      };
      // async requests are sent to all nodes and their result is stored in regNodesPromises array.
      regNodesPromises.push(rp(requestOptions));
   });   //loop ends
   
   Promise.all(regNodesPromises)
   .then(data => {
      const bulkRegisterOptions = {    // creating a new Object
         uri: newNodeUrl + '/register-nodes-bulk',
         method: 'POST',
         body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl] }, //using spread operator because we don't want an array of array but instead a spread out array.
         json: true
      };
      return rp(bulkRegisterOptions);
   })

   .then(data => {
      res.json({ note: 'New node registered with network successfully'});
   }) 

   .catch(err => console.log(err));
});   


// Broadcasted new Node will come to other nodes.
// This shouldn't be again broadcasted to avoid congestion.
// Hence it will just just register it without broadcasting.
app.post('/register-node', (req, res) => {
   const newNodeUrl = req.body.newNodeUrl;   
   const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;    // if index of newNode newNodeUrl is -1 or it does not exist in our networkNodes array then true else false.
   const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;     // new url shouldn't be the current node's url

   if (nodeNotAlreadyPresent && notCurrentNode)    // error handling                            
      bitcoin.networkNodes.push(newNodeUrl);       // pushing new node in the array al network nodes

   res.json({ note: 'New node registered successfully.'});     // success msg
});


// register multiple nodes at once
// this end point is hit only on a new node  
app.post('/register-nodes-bulk', (req, res) => {
   const allNetworkNodes = req.body.allNetworkNodes;
   allNetworkNodes.forEach(networkNodeUrl => {
      const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;    //node is already present
      const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
      //register each network url on the new node
      if (nodeNotAlreadyPresent && notCurrentNode)
         bitcoin.networkNodes.push(networkNodeUrl);
   });

   res.json({ note: "Bulk registration successful"});
});
``
app.listen(port, () => console.log('Listening to port ' + port));