const TrnxAddOn = require("../src/transactions/trnx.addon");

module.exports = function(app, wallet, blockchain) {
  app.get('/evoting/valid-ballot/:ballotId', function(req, res) {
    const ballotId = req.params.ballotId;
    let isValidBallot = TrnxAddOn.validBallot(blockchain.chain, ballotId);
    res.send({ isValid: isValidBallot });
  })

  app.post('/evoting/ballot/has-voted', function(req, res) {
    const { address, ballotId } = req.body;
    if(TrnxAddOn.validBallot(blockchain.chain, ballotId)) {
      let hasVoted = false;
      // find transactions with user address
      // find addons with ballotId, candidate and address
      for (let index = 0; index < blockchain.chain.length; index++) {
        const block = blockchain.chain[index];
        for (let transaction of block.data) {
          if(transaction.input.address === address) {
            if(transaction.addon) {
              if(transaction.addon.id) {
                const addonData = transaction.addon.data;
                if(addonData.created_at) continue;
                if(addonData.ballotId === ballotId && addonData.vote) {
                  hasVoted = true;
                }
              }
            }
          }
        }
      }
      res.send({ status: 1, hasVoted });
    } else {
      res.send({ status: 2, message: 'Invalid Ballot' });
    }
  })
}