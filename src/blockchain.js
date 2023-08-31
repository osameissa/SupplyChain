const SHA256 = require('crypto-js/sha256');

// declaring structure for blocks
class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}

// blockchain functions
class Blockchain {
    constructor(difficulty) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
    }

    createGenesisBlock() {
        const timestamp = Math.floor(new Date() / 1000);
        return new Block(0, "0", timestamp, "Genesis Block", this.calculateHash(0, "0", timestamp, "Genesis Block"));
    }

    calculateHash(index, previousHash, timestamp, data) {
        return SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();
    }

    addBlock(data) {
        const previousBlock = this.chain[this.chain.length - 1];
        const timestamp = Math.floor(new Date() / 1000);
        const index = previousBlock.index + 1;
        const hash = this.calculateHash(index, previousBlock.hash, timestamp, data);
        const block = new Block(index, previousBlock.hash, timestamp, data, hash);
        this.chain.push(block);

        if (!this.validateChain()) {
            this.chain.pop();
            throw new Error('Invalid block');
        }
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // validate data
            if (currentBlock.data !== currentBlock.data) return false;

            // validate block hash
            if (currentBlock.hash !== this.calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data)) return false;

            // validate previous block hash
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
}

module.exports = Blockchain;