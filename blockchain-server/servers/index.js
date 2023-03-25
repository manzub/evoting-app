const { apiResponse } = require('../helpers/network');
const TrnxAddOn = require('../src/transactions/trnx.addon');

// TODO: create add-on script to read and carry out functions

function currencyValue(wallet, blockchain) {
  const totalSupply = !process.env.MINT ? 1000 : (parseInt(process.env.MINT) * 2);
  const circulatingSupply = [...wallet.accounts.filter(x => !x.isZero)].reduce(function (sum, account) {
    return sum + wallet.calculateBalance({ chain: blockchain.chain, address: account.address })
  }, 0);
  // calculate value
  let usdValue = 1 + (circulatingSupply / totalSupply);
  return usdValue > 0 ? usdValue : 0;
}

module.exports = function (app, wallet, blockchain, transactionPool, p2pInstance) {
  app.get('/', function (req, res) {
    let usdRate = currencyValue(wallet, blockchain);
    let response = apiResponse({ message: 'Token value in USD', data: { usdRate: '1 => ' + usdRate.toFixed(2) } })
    res.json(response)
  })

  app.get('/chain', function (req, res) {
    let response = apiResponse({ status: 1, data: blockchain.chain });
    res.json(response)
  })

  app.get('/pool', function (req, res) {
    let response = apiResponse({ status: 1, data: transactionPool.pool });
    res.json(response)
  })

  // TODO: move transaction scanner routes to trnxscanner api

  app.get('/accounts', function (req, res) {
    // TODO: script account
    const accounts = wallet.accounts.filter(x => (x.address != '' && !x.isZero));
    let data = accounts.map(function (account) {
      let balance = wallet.calculateBalance({ chain: blockchain.chain, address: account.address })
      return {
        address: account.address,
        balance
      };
    })
    const response = apiResponse({ status: 1, data });
    res.json(response)
  })

  app.post('/accounts/new', function (req, res) {
    const account = wallet.createAccount();
    let response = apiResponse({ status: 1, data: account, message: 'New Account created' })
    res.json(response);
  })

  app.get('/accounts/:address', function (req, res) {
    const address = req.params.address;
    let account = wallet.accounts.find(x => x.address === address);
    if (account) {
      if (account.address != '') {
        const data = { address: account.address, balance: wallet.calculateBalance({ chain: blockchain.chain, address }) }
        let response = apiResponse({ status: 1, data })
        return res.json(response)
      }
    }
    return res.json(apiResponse({ status: 0, message: 'Invalid Wallet Address' }))
  })

  app.post('/transfer', function (req, res) {
    const { sender, recipient, amount, addon, type } = req.body;
    let response = apiResponse({ status: 0 })
    // TODO: add api keys
    if ((amount && recipient) && sender != '') {
      let senderWallet = wallet.accounts.find(account => account.address == sender)
      if (senderWallet) {
        if (wallet.accounts.find(account => account.address == recipient)) {
          let transaction = transactionPool.existTransaction({ sender, recipient });
          let gas = amount * 0.01

          try {
            // proceed
            let newTransaction = null;
            if (transaction && !addon) {
              newTransaction = transactionPool.updateTransaction(senderWallet, transaction, recipient, amount, gas);
            } else {
              // if extension data was sent with transaction
              if(addon && !transaction) {
                // create new extension object
                let extension = TrnxAddOn.createAddOn({ data: addon });
                // TODO: add-on extension to updates and new transactions
                // TODO: test addon
                newTransaction = wallet.createTransaction({ chain: blockchain.chain, sender, recipient, amount, addon: extension, gas });
              }
            }
            
            // TODO: auto miner
            if (newTransaction) {
              transactionPool.addToPool(newTransaction)
              p2pInstance.broadcastTransaction(transaction)
              response.status = 1
              response.data = newTransaction
              response.message = 'New Transaction Created'
            } else response.message = 'An Error Occurred'
          } catch (error) {
            console.trace(error)
            let response = apiResponse({ status: 1, message: error.message })
            return res.json(response)
          }
        } else response.message = 'Recipient address not found'
      } else response.message = 'Invalid sender address'
    } else response.message = 'Incompleted request'
    res.json(response)
  })
};