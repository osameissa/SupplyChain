const Network = require('./src/network'); // 
const port = process.argv[2];
const difficulty = 1;

const network = new Network(port, difficulty);

// Register nodes
if (process.argv.length > 3) {
    const nodes = process.argv.slice(3);
    nodes.forEach(node => {
        network.nodes.push(node);
    });
}

