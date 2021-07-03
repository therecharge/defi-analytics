const ethers = require("ethers");
const Web3Utils = require("web3-utils");
const { toWei, fromWei, BN } = Web3Utils;
const rechargeWallet = {
  ERC: ["0x3c2465d88C6546eac6F9aa6f79081Ad874CA2E8b"],
  HRC: [
    "0xb0bddd278C42F879A690bAfdc8301985C925b4f9",
    "0xFabede8fE44589A08FbF13C4425FaEE8CEaD63c0",
    "0x5eDf1BFA145d081bFafc85cc161f465E0788Eea7",
    "0x6D07380155d00922d2003bB7E7D4b83291D2394B",
    "0xC6EC1Bb3afDd25150db8F6c3aAEB2D407B2aBc17",
    "0x65aa81Feab9e36C4B5d5443Fb25532771e540E64",
    "0xE6C873acCE44746E7Dc918e3ac957bbE78d717EA",
    "0x9fA218bB826a847999875e38E39a79B59C8E365b",
    "0x8Ec4422a07c3404204221A074c00Cbb1667fFd4E",
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

const ERC20ABI = require("./abi/ERC20ABI.json");

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
  let ret = {
    ERC: {
      total: totalCirculation.ERC,
      redemption: "0",
      price: "1",
      swapped: "0",
      conversion: "0",
    },
    HRC: {
      total: totalCirculation.HRC,
      redemption: "0",
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
    body: JSON.stringify(ret),
  };

  console.log(
    `response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
