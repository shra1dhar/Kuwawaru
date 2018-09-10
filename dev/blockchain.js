const sha256 = require("sha256");

// constructor function
function Blockchain() {
   this.chain = [];              // all mined blocks will be here
   this.pendingTransactions = [];    // new transactions will be here

   // Genesis Block
   this.createNewBlock(100, 'dummy1', 'dummy2')
}

// prototype function - can be used again by other instances
// nounce can be any number. Its proof that we created block in a legitimate way (proof of work)
// transactions will be compressed to hash
Blockchain.prototype.createNewBlock = function(nounce, previousBlockHash, hash) {
   const newBlock = {      //block in our blockchain (const method)
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransaction,
      nounce: nounce,
      hash: hash,
      previousBlockHash: previousBlockHash
   };

   this.pendingTransaction = [];     // This empty array will be used to hold the new transactions every time
   this.chain.push(newBlock);    // Takes newBlock and pushes it into the chain

   return newBlock;
}

// Gettting the last Block of the chain (another prototype function)
Blockchain.prototype.getLastBlock = function() {
   return this.chain[this.chain.length - 1];
}

// Create a new transaction
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
   const newTransaction = {      //Transaction Object
      amount: amount,
      sender: sender,
      recipient: recipient
   };

   // Push this new transaction into the newTransaction array that we created earlier
   // Note: Different people will try to do transactions and this array will hold that info. When a transaction reaches this array, 
   // it isn't recorded in our blockchain yet (these are pending transactions). It is recorded only when a new block is created/mined. 
   this.pendingTransaction.push(newTransaction); 

   return this.getLastBlock()['index'] + 1;
}


// Hashing the block data   
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nounce) {
   const dataAsString = previousBlockHash + nounce.toString() + JSON.stringify(currentBlockData);
   const hash = sha256(dataAsString);
   return hash;
}


// Proof of Work Method
// Caculates and returns the correct nounce value for which the hash will have '000' in the beginning
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
   let nounce = 0;
   let hash = this.hashBlock(previousBlockHash, currentBlockData, nounce)
   while(hash.substring(1,3) != '00') {
      nounce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nounce);
   }
   return nounce;
}


// Export Constructor function to test.js
module.exports = Blockchain;