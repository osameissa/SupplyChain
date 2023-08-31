const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');

class Network {
    constructor(port, difficulty) {
        this.blockchain = new Blockchain(difficulty);
        this.nodes = [];
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.setupEndpoints();
        this.app.listen(port, () => console.log('Listening on port ' + port));
        //  periodically resolve conflicts between nodes every 10 seconds
        setInterval(this.resolveConflicts.bind(this), 10000);
    }

    // API-endpoints
    setupEndpoints() {
        // endpoint to retrieve blocks in blockchain
        this.app.get('/blocks', (req, res) => {
            res.json(this.blockchain.chain);
        });

        // endpoint to add a new block to the blockchain
        this.app.post('/mine', (req, res) => {
            const data = req.body.data;
            this.blockchain.addBlock(data);
            res.json(this.blockchain.chain);
        });

       // endpoint to register new nodes into network 
        this.app.post('/nodes/register', (req, res) => {
            const nodes = req.body.nodes;
            if (!nodes) {
                res.status(400).send('Error: Please supply a valid list of nodes.');
                return;
            }
            nodes.forEach(node => {
                this.nodes.push(node);
            });
            res.json({ message: 'New nodes have been added', nodes: this.nodes });
        });

        // endpoint to resolve conflicts and achieve consensus among nodes
        this.app.get('/nodes/resolve', (req, res) => {
            this.resolveConflicts(() => {
                res.json(this.blockchain.chain);
            });
        });
    }

    // resolve conflicts and achieve consensus among nodes
    resolveConflicts(callback = () => {}) {
        let newChain = null;
        let maxLength = this.blockchain.chain.length;

        const requests = this.nodes.map(node => {
            return new Promise((resolve, reject) => {
                request({ url: node + '/blocks', method: 'GET', json: true }, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        const chain = body;
                        if (chain.length > maxLength && this.blockchain.validateChain(chain)) {
                            maxLength = chain.length;
                            newChain = chain;
                        }
                    }
                    resolve();
                });
            });
        });

        // wait for all requests to complete, then update the chain if needed
        Promise.all(requests).then(() => {
            if (newChain) {
                this.blockchain.chain = newChain;
                console.log('Blockchain replaced');
            } else {
                console.log('Blockchain: OK');
            }
            callback();
        });
    }
}

module.exports = Network;