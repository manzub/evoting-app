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

  static validBallot(chain, ballotId) {
    let isValidBallot = false;
    for (let index = 0; index < chain.length; index++) {
      const block = chain[index];
      for (let transaction of block.data) {
        if(transaction.addon) {
          if (transaction.addon.id) {
            const addonData = transaction.addon.data;
            if (!addonData.created_at) continue;
            if(addonData.ballotId === ballotId) {
              isValidBallot = true;
            }
          }
        } else continue;
      }
    }
    return isValidBallot;
  }
}

module.exports = TrnxAddOn;