const { load } = require("dotenv");
var express = require("express");
var router = express.Router();
var BigNumber = require("bignumber.js");
var path = require("path");
var Contract = require("web3-eth-contract");
var GetContracts = require(path.join(__dirname, "../src/contracts.js"));
var ERC20 = require(path.join(__dirname, "../lib/contracts/ERC20.json"));
var POOL_ABI = require(path.join(__dirname, "../lib/contracts/POOL_ABI.json"));
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
var Contracts;

const adapter = new FileSync("db.json");
const db = low(adapter);
BigNumber.config({ EXPONENTIAL_AT: 1000 });

var networkById = {
  0: "eth",
  1: "bsc",
  2: "heco",
};
WalletList = [
  "0xfabede8fe44589a08fbf13c4425faee8cead63c0",
  "0xead8f1d4f431604941eca4b202bfc49b20db22aa",
  "0xe9afe2e8bfcc1974b1de7eb171dbe6698de4a7c6",
  "0xe6c873acce44746e7dc918e3ac957bbe78d717ea",
  "0xe11a2ee95b55ea65ed968f1c143aebbbe8b6cd81",
  "0xdca3936eae75f57ddfa4db08ba9570d09c701c4c",
  "0xdbe87ac1700fe226276aa00d94049826d2944f1d",
  "0xc6ec1bb3afdd25150db8f6c3aaeb2d407b2abc17",
  "0xc0f7c09dd6acdcac9515bc1c018c14e93c1757ff",
  "0xb97597e955e60dd38afab6c8408151a7ebacfd5e",
  "0xb0bddd278c42f879a690bafdc8301985c925b4f9",
  "0xac66a0e8bf3de069ffc043491cb8ca7b278529a0",
  "0xabc71f46fa0d80bcc7d36d662edbe9930271b414",
  "0x9fa218bb826a847999875e38e39a79b59c8e365b",
  "0x970ac5602855a86f3068edca5527342bc18a079a",
  "0x8ec4422a07c3404204221a074c00cbb1667ffd4e",
  "0x85e27690a5fe9e87f4c0e870092b5ae31eb2b043",
  "0x856415fd40a08c32612207ef6f65b8ca3d3327e4",
  "0x7a751fd82e0e81bcd1696bc7a1f623ee5ef60352",
  "0x78741a41eb7a244b2a15a8f5ce36cf21a398c9a7",
  "0x6d07380155d00922d2003bb7e7d4b83291d2394b",
  "0x6baebabe739a7416cfa48cf2051c14d4f3f36ad9",
  "0x66d1e2474ec6ddc5f45ab244c4415311624d2ddc",
  "0x65aa81feab9e36c4b5d5443fb25532771e540e64",
  "0x5edf1bfa145d081bfafc85cc161f465e0788eea7",
  "0x582df98a2b9dbc103e130db971c476bdd3ff830c",
  "0x54e0828208e41dbfe775c9c0c84b70c7634f186b",
  "0x5419eb32938e33b5e333f185e32bdad11d73a679",
  "0x45c0b31Bc83D4C5E430b15D790596878dF31c30e",
  "0x4074aff9235040981160153f3539c0f8cddaa901",
  "0x3c2465d88c6546eac6f9aa6f79081ad874ca2e8b",
  "0x1c0bec2236ede4f75b5c6d804bc07f3b04e1051e",
  "0x1a635f703ce22375709449e0fc58b5b3c0da63ed",
  "0x06835fda9334a55d8b8a8192d841ab8d0be3fff5",
  "0x05a21aeca80634097e4ace7d4e589bda0ee30b25",
  "0x9c20be0f142fb34f10e33338026fb1dd9e308da3",
  "0x82c02b9e84eef14354698ad48dc99caf5261c568",
  "0x0000000000000000000000000000000000000000",
];
const BridgeInfo = {
  eth: {
    bsc: "0x45c0b31Bc83D4C5E430b15D790596878dF31c30e",
    heco: "0xaBC71F46FA0D80bCC7D36D662Edbe9930271B44",
    "0x45c0b31Bc83D4C5E430b15D790596878dF31c30e": "bsc",
    "0xaBC71F46FA0D80bCC7D36D662Edbe9930271B414": "heco",
  },
  bsc: {
    eth: "0x45c0b31Bc83D4C5E430b15D790596878dF31c3e",
    heco: "0x05A21AECa80634097e4acE7D4E589bdA0EE30b5",
    "0x45c0b31Bc83D4C5E430b15D790596878dF31c30e": "eth",
    "0x05A21AECa80634097e4acE7D4E589bdA0EE30b25": "heco",
  },
  heco: {
    eth: "0xaBC71F46FA0D80bCC7D36D662Edbe9930271B44",
    bsc: "0x05A21AECa80634097e4acE7D4E589bdA0EE30b5",
    "0xaBC71F46FA0D80bCC7D36D662Edbe9930271B414": "eth",
    "0x05A21AECa80634097e4acE7D4E589bdA0EE30b25": "bsc",
  },
  Addresses: [
    "0x45c0b31Bc83D4C5E430b15D790596878dF31c30e",
    "0xaBC71F46FA0D80bCC7D36D662Edbe9930271B414",
    "0x05A21AECa80634097e4acE7D4E589bdA0EE30b25",
  ],
  fee: {
    eth: "5000000000000000000",
    bsc: "500000000000000000",
    heco: "500000000000000000",
  },
};
// var Dashboard = new Object({
//   totalCirculation: {
//     eth: undefined,
//     bsc: undefined,
//     heco: undefined,
//     lastUpdate: 0,
//     CycleUpdate: 300000, // 5 minute
//   },
//   numberOf: {
//     Plugged: 1,
//     Charger: 0, // Update at function named UpdateNumberOf()
//     Bridges: 2,
//     lastUpdate: 0,
//     CycleUpdate: 86400000, // 1 day
//   },
//   Accumulated: {
//     eth: {
//       Redemption: 0,
//       SwappedIn: 0,
//       ConversionFee: 0,
//       currentBlock: 13690379,
//       offset: 500,
//     },
//     bsc: {
//       Redemption: 0,
//       SwappedIn: 0,
//       ConversionFee: 0,
//       currentBlock: 0,
//       offset: 3000,
//     },
//     heco: {
//       Redemption: 0,
//       SwappedIn: 0,
//       ConversionFee: 0,
//       currentBlock: 0,
//       offset: 3000,
//     },
//     lastUpdate: 0,
//     CycleUpdate: 300000, // 1 day
//   },
// });
// db.defaults({ Dashboard: Dashboard }).write();
var Dashboard = db.getState().Dashboard;
console.log(Dashboard);
const LoadAnalysis = async () => {
  console.log("Update Started...");
  // Load Contract Instance if it is empty
  if (typeof Contracts == "undefined") Contracts = await GetContracts();

  // Update all datas
  UpdateTotalCirculation();
  UpdateNumberOf();
  UpdateAccumulated();
  db.set("Dashboard", Dashboard).write();
  // console.log(Dashboard);
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

const UpdateAccumulated = async () => {
  let { lastUpdate, CycleUpdate } = Dashboard.Accumulated;
  if (lastUpdate > Date.now() - CycleUpdate) return;
  lastUpdate = Date.now();
  console.log("Updating Accumulated data...");
  // 네트워크별 인스턴스 끌어오고
  // 해당 인스턴스 블록 돌리면서 lastblock 업데이트 하고
  // 모든 트랜잭션들 로딩해서 필터로 던지고
  // 필터에서는 정산하여 데이터에 반영하고
  const networks = Object.keys(Contracts.ERC20);
  networks.map(async (network) => {
    const Token = Contracts.ERC20[network];
    const lastBlock = await Token.constructor.web3.eth.getBlockNumber();
    while (true) {
      let { Redemption, SwappedIn, ConversionFee, currentBlock, offset } =
        Dashboard.Accumulated[network];
      const toBlock =
        lastBlock > currentBlock + offset ? currentBlock + offset : lastBlock;
      console.log(network, currentBlock);
      if (currentBlock >= lastBlock || currentBlock == 0) return;

      const eventsRedemption = await Token.getPastEvents("Transfer", {
        filter: {
          to: "0x82C02b9E84eeF14354698AD48dc99Caf5261C568",
        },
        fromBlock: currentBlock + 1,
        toBlock: toBlock,
      });
      const eventsSwappedIn = await Token.getPastEvents("Transfer", {
        filter: {
          from: BridgeInfo.Addresses,
        },
        fromBlock: currentBlock + 1,
        toBlock: toBlock,
      });
      const events = eventsRedemption.concat(eventsSwappedIn);
      events.map((event) => {
        const { from, to, value } = event.returnValues;
        console.log(event.transactionHash, from, to, value);
        if (to == "0x82C02b9E84eeF14354698AD48dc99Caf5261C568") {
          Redemption = new BigNumber(Redemption).plus(value).toString();
        }
        if (
          BridgeInfo.Addresses.includes(from) &&
          !WalletList.includes(to.toLowerCase())
        ) {
          SwappedIn = new BigNumber(SwappedIn).plus(value).toString();
          ConversionFee = new BigNumber(ConversionFee)
            .plus(BridgeInfo.fee[network])
            .toString();
        }
        console.log("SwappedIn", SwappedIn);
      });

      Dashboard.Accumulated[network] = {
        ...Dashboard.Accumulated[network],
        Redemption: Redemption,
        SwappedIn: SwappedIn,
        ConversionFee: ConversionFee,
        currentBlock: toBlock,
      };
    }
  });

  Dashboard.Accumulated = { ...Dashboard.Accumulated, lastUpdate };
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.send(JSON.stringify(Dashboard));
});

module.exports = router;
