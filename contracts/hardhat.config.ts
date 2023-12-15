import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";


const {
  MAINNET_URL
  , PUPPYNET_URI
  , SHIBARIUM_URI
  , ETHERSCAN_API_KEY
  , DEPLOY_PRIVATE
  , PRIVATE_KEY
  , HOT_PRIVATE
  , LOCAL_NODE_PRIVATEKEY
  , ALCHEMY_GOERLI_RPC
} = process.env;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 31337
    },
    mainnet: {
      url: MAINNET_URL,
      accounts: [`0x${DEPLOY_PRIVATE}`],
      chainId: 1
    },
    goerli: {
      url: ALCHEMY_GOERLI_RPC,
      accounts: [`0x${HOT_PRIVATE}`],
      chainId: 5
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      //  accounts: [`0x${PRIVATE_KEY}`],
      accounts: [`0x${LOCAL_NODE_PRIVATEKEY}`],
      //  balance: "1000",
      chainId: 31337,
    },
    puppynet: {
      url: PUPPYNET_URI,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 719,
    },
    shibarium: {
      url: SHIBARIUM_URI,
      accounts: [`0x${HOT_PRIVATE}`],
      // accounts: [`0x${DEPLOY_PRIVATE}`],
      chainId: 109,
      gas: 3000000,
      gasPrice: 2500000007,
      gasMultiplier: 2
    }
  },
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "shibarium",
        chainId: 109,
        urls: {
          apiURL: "https://www.shibariumscan.io/api/",
          browserURL: "https://www.shibariumscan.io/"
        }
      }
    ]
  },
  defaultNetwork: "localhost",
};

export default config;