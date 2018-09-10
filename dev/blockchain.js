// constructor function
function Blockchain() {
   this.chain = [];        // all mined blocks will be here
   this.newTransactions = [];    // new transactions will be here
}

// prototype function - can be used again by other instances
// nounce can be any number. Its proof that we created block in a legitimate way (proof of work)
// transactions will be cpmpressed to hash
Blockchain.prototype.createNewBlock = function(nounce, previousBlockHash, hash) {
   const newBlock = {      //block in our blockchain (const method)
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.newTransactions,
      nounce: nounce,
      hash: hash,
      previousBlockHash: previousBlockHash
   };

   this.newTransaction = [];     // This empty array will be used to hold the new transactions every time
   this.chain.push(newBlock);    // Takes newBlock and pushes it into the chain

   return newBlock;
}