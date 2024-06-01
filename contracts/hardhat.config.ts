import { config as dotEnvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/types";

dotEnvConfig();

const {
  MAINNET_URL,
  PUPPYNET_URI,
  SHIBARIUM_URI,
  ETHERSCAN_API_KEY,
  SPARK_PRIVATE,
  LOCAL_NODE_PRIVATEKEY,
  ALCHEMY_SEPOLIA_RPC
} = process.env;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 31337
    },
    mainnet: {
      url: MAINNET_URL,
      accounts: [`0x${SPARK_PRIVATE}`],
      chainId: 1
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA_RPC,
      accounts: [`0x${SPARK_PRIVATE}`],
      chainId: 11155111
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      accounts: [`0x${LOCAL_NODE_PRIVATEKEY}`],
      chainId: 31337,
    },
    puppynet: {
      url: PUPPYNET_URI,
      accounts: [`0x${SPARK_PRIVATE}`],
      chainId: 719,
    },
    shibarium: {
      url: SHIBARIUM_URI,
      accounts: [`0x${SPARK_PRIVATE}`],
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
