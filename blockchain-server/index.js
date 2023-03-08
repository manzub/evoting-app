// TODO: check process.env.debug=true
const express = require("express");
const cors = require("cors")
const { getNetworkAddress } = require("./helpers/network");
// modules
const Blockchain = require('./src/blockchain/blockchain');
const TransactionPool = require('./src/transactions/trnx.pool');
const Wallet = require('./src/wallet/wallet');
const P2PServer = require('./servers/peers');
const cron = require("node-cron");
const { addToChain } = require("./src/blockchain/blockchain.utils");
const Miner = require("./src/blockchain/miner");

// initialize imports
const app = express();

const transactionPool = new TransactionPool();
const blockchain = new Blockchain();
const wallet = new Wallet();
const miner = new Miner({ blockchain, trnxPool: transactionPool });
const p2pInstance = new P2PServer({ blockchain, trnxPool: transactionPool, wallet });
// configs
const DEFAULT_PORT = 3001;
const randPort = Math.floor(Math.random() * 9999);
const HTTP_PORT = process.env.PEERS ? randPort : DEFAULT_PORT;
// check and create zero address
if (wallet.accounts.length == 0) {
  let zero_account = wallet.createAccount();
  let zero_block = miner.mineNewBlock({ minerWallet: zero_account.address, lastBlock: blockchain.chain[blockchain.chain.length -1], reward: ((parseInt(process.env.MINT) * 2) || 1000) });
  blockchain.addBlock({ block: zero_block, data: [] });
  p2pInstance.broadcastChain();
}

app.use(require("morgan")("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

require('./servers/index')(app, wallet, blockchain, transactionPool, p2pInstance)
require('./servers/miner.routes')(app, blockchain, transactionPool, p2pInstance, wallet)

// default page not found route
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

// listen p2p
p2pInstance.listen();
// listen http
app.listen(HTTP_PORT, () => {
  // do some things
  if (wallet.accounts.length == 1) {
    // create a default account and mint value
    let owner_account = wallet.createAccount();
    if(process.env.MINT) {
      let trnx = wallet.createTransaction({ chain: blockchain.chain, sender: wallet.accounts[0].address, recipient: owner_account.address, amount: parseInt(process.env.MINT), gas: 0 })
      let another_block = miner.mineNewBlock({ minerWallet: owner_account.address, lastBlock: blockchain.chain[blockchain.chain.length-1], reward: 0 });
      blockchain.addBlock({ block: another_block, data: [{...trnx, status: 'complete'}] })
      p2pInstance.broadcastChain();
    }
    console.log(`Default/Mint Account <${owner_account.address}>`)
  }
  // log server message
  const networkAddress = getNetworkAddress()[0][0];
  console.log('HTTP Server listening on\n' +
    `http://${networkAddress}:${HTTP_PORT}` +
    `\thttp://localhost:${HTTP_PORT}`
  );
})
// schedule cron
let count = 0;
cron.schedule('*/5 * * * * *', () => {
  count++
  addToChain({ transactionPool, blockchain, p2pInstance }, count)
})