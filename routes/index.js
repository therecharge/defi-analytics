const { load } = require('dotenv');
var express = require('express');
var router = express.Router();
var path = require('path');
var GetContracts = require(path.join(__dirname, '../src/contracts.js'))
var ERC20 = require(path.join(__dirname, '../lib/contracts/ERC20.json'))

var Contracts;

var Dashboard = new Object({
  totalCirculation: {
    eth: undefined,
    bsc: undefined,
    heco: undefined,
    lastUpdate: 0,
    CycleUpdate: 300000, // 5 minute
  },
  numberOf: {
    Plugged: 1,
    Charger: 0, // Update at function named UpdateNumberOfCharger()
    Bridges: 2,
    lastUpdate: 0,
    CycleUpdate: 86400000 // 1 day
  }
})

const LoadAnalysis = async () => {
  console.log("Update Started...");
  // Load Contract Instance if it is empty
  if(typeof Contracts == "undefined") Contracts = await GetContracts();


  // Update all datas
  UpdateTotalCirculation();
  UpdateNumberOfCharger();


}
LoadAnalysis();
setInterval(LoadAnalysis, 5000);

const UpdateTotalCirculation = async () => {
  let {eth, bsc, heco, lastUpdate, CycleUpdate} = Dashboard.totalCirculation;
  if(lastUpdate < Date.now() - CycleUpdate){ // Update only when capped cycled time
    console.log("Updating total Circulation...");
    lastUpdate = Date.now();
    [eth, bsc, heco] = await Promise.all([
      await Contracts.ERC20.eth.totalSupply(),
      await Contracts.ERC20.bsc.totalSupply(),
      await Contracts.ERC20.heco.totalSupply(),
    ])

    const subFoundations = async (balance, network) => balance.sub((await Promise.all(ERC20.TotalBalance_BlackList[network].map((address)=>{
      return Contracts.ERC20[network].balanceOf(address);
    }))).reduce((a,b) => (a.add(b))))
    
    eth = await subFoundations(eth, "eth");
    bsc = await subFoundations(bsc, "bsc");
    // heco = await subFoundations(heco, "heco"); // FIXME WHEN HECO ACTIVATE


    eth = eth.toString();
    bsc = bsc.toString();
    heco = (0).toString(); // FIXME WHEN HECO ACTIVATE
    Dashboard.totalCirculation = {eth,bsc,heco,lastUpdate,CycleUpdate};
  }
}

const UpdateNumberOfCharger = async() => {
  let {Charger, lastUpdate, CycleUpdate} = Dashboard.numberOf;
  if(lastUpdate > Date.now() - CycleUpdate) return;
  lastUpdate = Date.now();
  console.log("Updating Number Of Charger...");

  Charger = (
    await Promise.all([
      (await Contracts.ChargerList.eth.get()).length,
      (await Contracts.ChargerList.bsc.get()).length
    ])
  ).reduce((a,b)=>(a+b));

  Dashboard.numberOf = {...Dashboard.numberOf, Charger, lastUpdate}
}

/* GET home page. */
router.get('/', async function(req, res, next) {

  res.send(JSON.stringify(Dashboard));
});

module.exports = router;
