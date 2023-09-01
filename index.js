const Network = require('./src/network'); 

// node index.js x
// port = x
const port = process.argv[2];
const difficulty = 1;
const network = new Network(port, difficulty);

// node index.js 3000 http://localhost:3000 http://localhost:3001 http://localhost:3002
// registers nodes into the network
if (process.argv.length > 3) {
    const nodes = process.argv.slice(3);
    nodes.forEach(node => {
        network.nodes.push(node);
    });
}
