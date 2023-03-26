const crypto = require("crypto");
const { readdirSync, readFileSync, writeFileSync, unlinkSync } = require("fs");
const { chainDataPath } = require("../../helpers");

const GENESIS_DATA = {
  timestamp: 1654847852939,
  lastHash: 'f1r57-3v3rh45h',
  hash: 'r4nd-h45h',
  data: [],
  nonce: 0,
  difficulty: 6
}

function cryptoHash(...inputs) {
  const hash = crypto.createHash('sha256');
  hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '))
  return hash.digest('hex')
}

function addToChain({ transactionPool, blockchain, p2pInstance }, count) {
  return null;
}

function loadSavedChain() {
  const dir = `${chainDataPath}/blocks`
  const blocks = readdirSync(dir).map(function(data) {
    return JSON.parse(readFileSync(`${dir}/${data}`))
  })
  return blocks;
}

function replaceSavedChain(chain) {
  const dir = `${chainDataPath}/blocks`
  readdirSync(dir).forEach(data => unlinkSync(`${dir}/${data}`))
  chain.forEach(data => saveBlockLocal(data))
}

function saveBlockLocal(block) {
  const serializedBlock = JSON.stringify(block);
  writeFileSync(`${chainDataPath}/blocks/block_${block.timestamp}.dat`, serializedBlock, { flag: 'w' })
}

module.exports = {
  GENESIS_DATA,
  cryptoHash,
  addToChain,
  loadSavedChain,
  replaceSavedChain,
  saveBlockLocal,
  MINE_RATE: 1000
}