const path = require('path')
const contract = require("@truffle/contract");
const Web3 = require("web3");
require("dotenv").config();

const Artifacts = {
  ERC20: require(path.join(__dirname, '../lib/contracts/ERC20.json')),
  ChargerList: require(path.join(__dirname, '../lib/contracts/ChargerList.json'))
}

const Providers = {
  eth: new Web3.providers.HttpProvider(process.env.RPC_ETH),
  bsc: new Web3.providers.HttpProvider(process.env.RPC_BSC),
  heco: new Web3.providers.HttpProvider(process.env.RPC_HECO),
};

const GetContracts = async () => {
  return {
    ERC20:{
    eth: await _GetContract(Artifacts.ERC20, Providers.eth),
    bsc: await _GetContract(Artifacts.ERC20, Providers.bsc),
    heco: await _GetContract(Artifacts.ERC20, Providers.heco)
    },
    ChargerList:{
    eth: await _GetContract(Artifacts.ChargerList, Providers.eth),
    bsc: await _GetContract(Artifacts.ChargerList, Providers.bsc),
    // heco: await _GetContract(Artifacts.ChargerList, Providers.heco)
    }
  }
}

const _GetContract = async (artifact, provider) => {
  var Contract = contract(artifact);
  Contract.setProvider(provider)
  return await Contract.deployed();
}

module.exports = GetContracts;
