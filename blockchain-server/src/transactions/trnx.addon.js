const { v4 } = require("uuid");
const { cryptoHash } = require("../blockchain/blockchain.utils");

class TrnxAddOn {
  constructor({ timestamp, hash, data }) {
    this.id = v4();
    this.timestamp = timestamp;
    this.hash = hash;
    this.data = data
  }

  static createAddOn({ data }) {
    let timestamp = Date.now()
    let hash = cryptoHash(timestamp, data);
    return new this({ timestamp, hash, data });
  }
}

module.exports = TrnxAddOn;