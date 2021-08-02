const ethers = require("ethers");
const Web3Utils = require("web3-utils");
const { toWei, fromWei, BN } = Web3Utils;
const rechargeWallet = {
  ERC: [
    "0x3c2465d88C6546eac6F9aa6f79081Ad874CA2E8b",
    "0x582df98a2b9dbc103e130db971c476bdd3ff830c",
    "0x5419eb32938e33b5e333f185e32bdad11d73a679",
  ],
  HRC: [
    "0x1a635f703ce22375709449e0fc58b5b3c0da63ed",
    "0x3c2465d88c6546eac6f9aa6f79081ad874ca2e8b",
    "0x4074aff9235040981160153f3539c0f8cddaa901",
    "0x5419eb32938e33b5e333f185e32bdad11d73a679",
    "0x582df98a2b9dbc103e130db971c476bdd3ff830c",
    "0x5edf1bfa145d081bfafc85cc161f465e0788eea7",
    "0x65aa81feab9e36c4b5d5443fb25532771e540e64",
    "0x6baebabe739a7416cfa48cf2051c14d4f3f36ad9",
    "0x6d07380155d00922d2003bb7e7d4b83291d2394b",
    "0x8ec4422a07c3404204221a074c00cbb1667ffd4e",
    "0x9fa218bb826a847999875e38e39a79b59c8e365b",
    "0xac66a0e8bf3de069ffc043491cb8ca7b278529a0",
    "0xb0bddd278c42f879a690bafdc8301985c925b4f9",
    "0xc0f7c09dd6acdcac9515bc1c018c14e93c1757ff",
    "0xc6ec1bb3afdd25150db8f6c3aaeb2d407b2abc17",
    "0xdbe87ac1700fe226276aa00d94049826d2944f1d",
    "0xdca3936eae75f57ddfa4db08ba9570d09c701c4c",
    "0xe6c873acce44746e7dc918e3ac957bbe78d717ea",
    "0xead8f1d4f431604941eca4b202bfc49b20db22aa",
    "0xfabede8fe44589a08fbf13c4425faee8cead63c0",
  ],
};
const tokenAddress = {
  ERC: "0xe74bE071f3b62f6A4aC23cA68E5E2A39797A3c30",
  HRC: "0xbddC276CACC18E9177B2f5CFb3BFb6eef491799b",
};
const provider = {
  ERC: new ethers.providers.JsonRpcProvider(
    "https://eth-mainnet.alchemyapi.io/v2/2wgBGtGnTm3s0A0o23RY0BtXxgow1GAn"
  ),
  HRC: new ethers.providers.JsonRpcProvider(
    "https://http-mainnet.hecochain.com"
  ),
};
const networks = ["ERC", "HRC"];

const ERC20ABI = require("../abis/ERC20_ABI.json");

const getBalance = async () => {
  let totalCirculation = {
    ERC: new BN(toWei("1000000000", "ether")),
    HRC: new BN(toWei("1000000000", "ether")),
  };
  const res = await Promise.all(
    networks.map(async (network) => {
      const tokenI = new ethers.Contract(
        tokenAddress[network],
        ERC20ABI,
        provider[network]
      );
      return Promise.all(
        rechargeWallet[network].map(async (address) => {
          return (await tokenI.balanceOf(address)).toString();
        })
      );
    })
  );

  res.map((balances, i) => {
    balances.map((balance) => {
      totalCirculation[networks[i]] = totalCirculation[networks[i]].sub(
        new BN(balance)
      );
    });
  });
  return {
    ERC: totalCirculation.ERC.toString(),
    HRC: totalCirculation.HRC.toString(),
  };
};

const getRedemption = async () => {
  let Redemptions = {
    ERC: "0",
    HRC: "0",
  };
  const res = await Promise.all(
    networks.map(async (network) => {
      const tokenI = new ethers.Contract(
        tokenAddress[network],
        ERC20ABI,
        provider[network]
      );
      return Promise.all(
        rechargeWallet[network].map(async (address) => {
          return (await tokenI.basePercent()).toString();
        })
      );
    })
  );

  res.map((balances, i) => {
    balances.map((balance) => {
      Redemptions[networks[i]] = balance;
    });
  });
  return {
    ERC: Redemptions.ERC.toString(),
    HRC: Redemptions.HRC.toString(),
  };
};

exports.getAllItemsHandler = async (event) => {
  const { httpMethod, path } = event;
  if (httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${httpMethod}`
    );
  }
  // All log statements are written to CloudWatch by default. For more information, see
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
  console.log("received:", JSON.stringify(event));

  const totalCirculation = await getBalance();
  const redemptions = await getRedemption();
  let ret = {
    ERC: {
      total: totalCirculation.ERC,
      redemption: redemptions.ERC,
      price: "1",
      swapped: "0",
      conversion: "0",
    },
    HRC: {
      total: totalCirculation.HRC,
      redemption: redemptions.HRC,
      price: "1",
      swapped: "0",
      conversion: "0",
    },
    general: {
      ServicesPlugged: 1,
      ChargersActivated: 10,
      BridgesActivated: 1,
      RedemptionRate: 200,
      ProposalsPosted: 1,
      ProposalsApproved: 10,
      ProposalsRejected: 1,
      ProposalsPending: 10,
    },
  };

  const response = {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(ret),
  };

  console.log(
    `response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
