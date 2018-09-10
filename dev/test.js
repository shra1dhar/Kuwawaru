const Blockchain = require('./blockchain');

// Instance of Blockchain constructor function
const bitcoin = new Blockchain();

const previousBlockHash = '09dfsh9dhf9s8';
const currentBlockData = [
   {
      amount: 10,
      sender: 'JIM',
      recipient: 'Shravan'
   },
   {
      amount: 20,
      sender: 'IMEA',
      recipient: 'NIK'
   },
   {
      amount: 300,
      sender: 'LILLY',
      recipient: 'Arnav'
   }
];
const nounce = 100;


console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nounce));


// console.log(bitcoin.chain[1]); 