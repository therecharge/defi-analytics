const ethers = require("ethers");
const Web3Utils = require("web3-utils");
const { toWei, fromWei, BN } = Web3Utils;
const WalletList = [
  "0xfabede8fe44589a08fbf13c4425faee8cead63c0",
  "0xead8f1d4f431604941eca4b202bfc49b20db22aa",
  "0xe9afe2e8bfcc1974b1de7eb171dbe6698de4a7c6",
  "0xe6c873acce44746e7dc918e3ac957bbe78d717ea",
  "0xe11a2ee95b55ea65ed968f1c143aebbbe8b6cd81",
  "0xdca3936eae75f57ddfa4db08ba9570d09c701c4c",
  "0xdbe87ac1700fe226276aa00d94049826d2944f1d",
  "0xc6ec1bb3afdd25150db8f6c3aaeb2d407b2abc17",
  "0xc0f7c09dd6acdcac9515bc1c018c14e93c1757ff",
  "0xbc2DDb693Ff20eed23aeB216Dc618e6D2a36ba75",
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
];
const rechargeWallet = {
  ERC: WalletList,
  HRC: WalletList,
  BEP: WalletList,
};
const tokenAddress = {
  ERC: "0xe74bE071f3b62f6A4aC23cA68E5E2A39797A3c30",
  HRC: "0xbddC276CACC18E9177B2f5CFb3BFb6eef491799b",
  BEP: "0x2D94172436D869c1e3c094BeaD272508faB0d9E3",
};
const provider = {
  ERC: new ethers.providers.JsonRpcProvider(
    "https://eth-mainnet.alchemyapi.io/v2/2wgBGtGnTm3s0A0o23RY0BtXxgow1GAn"
  ),
  HRC: new ethers.providers.JsonRpcProvider(
    "https://http-mainnet.hecochain.com"
  ),
  BEP: new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org/"
  ),
};
const networks = ["ERC", "HRC", "BEP"];

const ERC20ABI = require("../abis/ERC20_ABI.json");

const getBalance = async () => {
  let totalCirculation = {
    ERC: new BN(toWei("999020000", "ether")),
    HRC: new BN(toWei("999020000", "ether")),
    BEP: new BN(toWei("999020000", "ether")),
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
    BEP: totalCirculation.BEP.toString(),
  };
};

const getRedemption = async () => {
  let Redemptions = {
    ERC: "0",
    HRC: "0",
    BEP: "0",
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
    BEP: Redemptions.BEP.toString(),
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
      price: "0",
      swapped: "0",
      conversion: "0",
    },
    BEP: {
      total: totalCirculation.BEP,
      redemption: redemptions.BEP,
      price: "0",
      swapped: "0",
      conversion: "0",
    },
    general: {
      ServicesPlugged: 1,
      ChargersActivated: 1,
      BridgesActivated: 0,
      RedemptionRate: redemptions.HRC,
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
