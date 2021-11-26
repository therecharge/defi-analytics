const { load } = require("dotenv");
var express = require("express");
var router = express.Router();
var path = require("path");
var Contract = require("web3-eth-contract");
var GetContracts = require(path.join(__dirname, "../src/contracts.js"));
var ERC20 = require(path.join(__dirname, "../lib/contracts/ERC20.json"));
var POOL_ABI = require(path.join(__dirname, "../lib/contracts/POOL_ABI.json"));

var Contracts;

var networkById = {
  0: "eth",
  1: "bsc",
  2: "heco",
};

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
    Charger: 0, // Update at function named UpdateNumberOf()
    Bridges: 2,
    lastUpdate: 0,
    CycleUpdate: 86400000, // 1 day
  },
});

const LoadAnalysis = async () => {
  console.log("Update Started...");
  // Load Contract Instance if it is empty
  if (typeof Contracts == "undefined") Contracts = await GetContracts();

  // Update all datas
  UpdateTotalCirculation();
  UpdateNumberOf();
  console.log(Dashboard);
};
LoadAnalysis();
setInterval(LoadAnalysis, 5000);

const UpdateTotalCirculation = async () => {
  let { eth, bsc, heco, lastUpdate, CycleUpdate } = Dashboard.totalCirculation;
  if (lastUpdate < Date.now() - CycleUpdate) {
    // Update only when capped cycled time
    console.log("Updating total Circulation...");
    lastUpdate = Date.now();
    [eth, bsc, heco] = await Promise.all([
      await Contracts.ERC20.eth.totalSupply(),
      await Contracts.ERC20.bsc.totalSupply(),
      await Contracts.ERC20.heco.totalSupply(),
    ]);

    const subFoundations = async (balance, network) =>
      balance.sub(
        (
          await Promise.all(
            ERC20.TotalBalance_BlackList[network].map((address) => {
              return Contracts.ERC20[network].balanceOf(address);
            })
          )
        ).reduce((a, b) => a.add(b))
      );

    eth = await subFoundations(eth, "eth");
    bsc = await subFoundations(bsc, "bsc");
    // heco = await subFoundations(heco, "heco"); // FIXME WHEN HECO ACTIVATE

    eth = eth.toString();
    bsc = bsc.toString();
    heco = (0).toString(); // FIXME WHEN HECO ACTIVATE
    Dashboard.totalCirculation = { eth, bsc, heco, lastUpdate, CycleUpdate };
  }
};

const UpdateNumberOf = async () => {
  let { Charger, lastUpdate, CycleUpdate } = Dashboard.numberOf;
  if (lastUpdate > Date.now() - CycleUpdate) return;
  lastUpdate = Date.now();
  console.log("Updating Number Of Charger...");

  ChargerList = await Promise.all([
    await Contracts.ChargerList.eth.get(),
    await Contracts.ChargerList.bsc.get(),
  ]);

  const isActive = async (startTime, endTime, name = "") => {
    const now = (await Date.now()) / 1000;
    if (name.includes("11.1 ")) return false;
    console.log(
      now > startTime && now < endTime,
      startTime.toString(),
      endTime.toString(),
      now.toString()
    );
    return now > startTime && now < endTime;
  };
  Dashboard.numberOf.Charger = 0;
  ChargerList.map((list, networkId) => {
    list.map(async (chargerAddress) => {
      Contract.setProvider(Contracts.Providers[networkById[networkId]].host);
      const charger = new Contract(POOL_ABI, chargerAddress);
      const name = await charger.methods.name().call();
      const startTime = await charger.methods.startTime().call();
      const endTime = await charger.methods.periodFinish().call();
      if (await isActive(startTime, endTime, name))
        Dashboard.numberOf.Charger++;
    });
  });

  Dashboard.numberOf = { ...Dashboard.numberOf, Charger, lastUpdate };
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.send(JSON.stringify(Dashboard));
});

module.exports = router;
