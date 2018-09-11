const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

// Instance of Blockchain
const bitcoin = new Blockchain();


// If req comes in with json data then parse it to access these routes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
 
//
app.get('/blockchain', (req, res) => {
   res.send(bitcoin);
});

// Weare supposed to send data to this end point
app.post('/transaction', (req, res) => {
   console.log(req.body);
   res.send(`The amount of transaction is ${req.body.amount} bitcoin.`);   // Backticks instead of quotes are used.
});

app.get('/mine', (req, res) => {

});

app.listen(3000, () => console.log('Listening to port 3000...'));