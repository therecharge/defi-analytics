const Web3 = require("web3");
require("dotenv").config();

const web3ByNetwork = {
  eth: new Web3(process.env.RPC_ETH),
  bsc: new Web3(process.env.RPC_BSC),
  heco: new Web3(process.env.RPC_HECO),
};

module.exports = {};
