import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config"
import "@nomicfoundation/hardhat-toolbox";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL 
const PRIVATE_KEY = process.env.PRIVATE_KEY || "privatKey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || ""

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {version: "0.8.17"},
    ],
  },
  networks: {
    hardhat: {
      hardfork: "merge"
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

export default config;
