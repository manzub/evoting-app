#!/usr/bin/env node

require('dotenv').config();
const { default: axios } = require('axios');
const { default: chalk } = require('chalk');
const app = require('commander');
const inquirer = require('inquirer');
const WebSocket = require('ws');

const serverUrl = 'http://localhost';

app.version('1.0.0')
.option('-e, --environment [environment]', 'Environment to work with', 'development')
.option('--port [port]', 'Server port', '3001')
.action(async function(options) {
  let miner = { address: null, apiKey: process.env.API_KEY};
  // get miner key from blockchain node
  if(['prod', 'production'].includes(options.environment)) {
    do {
      const minerLogin = await inquirer.prompt([ 
        { type: 'input', name: 'address', message: 'Enter your wallet address:' },
        { type: 'password', name: 'passKey', message: 'Enter your passKey' } 
      ])
      if(minerLogin.address && minerLogin.passKey) {
        const response = await axios.post(`${serverUrl}:${options.port}/miner/login`, minerLogin)
        if(response.status == 200) {
          const { message, data } = response.data;
          if(data && data.apiKey) {
            miner = data;
            console.log(chalk.green(message));
          } else console.log(chalk.red(message))
        }
      }
    } while (miner.address == null);
  }
  // start main application
  let action = null;
  do {
    const menuOptions = ['Start Miner', 'Check Rewards'];
    const menu = await inquirer.prompt([
      { type: 'list', name: 'options', message: 'What would you like to do?', choices: menuOptions }
    ])
    if(menu.options) {
      switch (menu.options) {
        case menuOptions[0]:
          // TODO: socket miner
          const ws = new WebSocket('ws://localhost:5001')
          ws.on('open', () => {
            ws.send(JSON.stringify({ type:'MINER', address: miner.address }))
          })

          ws.on('message', message => {
            const parsedMessage = JSON.parse(message);
            if(parsedMessage.type == 'MINER') {
              console.log(parsedMessage.result);
              ws.send(JSON.stringify({ type:'MINER', address: miner.address }))
            }
          })

          ws.on('error', () => {
            console.log('An error occurred, reconnecting to miner');
            setTimeout(() => {
              ws.send(JSON.stringify({ type:'MINER', address: miner.address }))
            }, 7000);
          })

          ws.on('close', () => {
            console.log('An error occurred, reconnecting to miner');
            setTimeout(() => {
              ws.send(JSON.stringify({ type:'MINER', address: miner.address }))
            }, 7000);
          })
          break;
        case menuOptions[1]:
          const response = await axios.get(`${serverUrl}:${options.port}/miner/rewards/${miner.address}`)
          if(response.status == 200) {
            const { data:minerRewards } = response.data
            if(minerRewards.rewards <= 0) {
              console.log('==========INFO==========')
              console.log(chalk.red(`Mining Rewards: ${minerRewards.rewards}`));
              console.log(chalk.bgCyan(`Wallet Balance: ${minerRewards.balance}`))
              console.log('\n')
            } else {
              console.log('==========INFO==========')
              console.log(chalk.green(`Mining Rewards: ${minerRewards.rewards}`));
              console.log(chalk.green(`Wallet Balance: ${minerRewards.balance}`))
              console.log('\n')
            }
          }
          break;
      }
    }
  } while (action == null);
})

app.parse(process.argv)