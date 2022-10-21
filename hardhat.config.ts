import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {version: "0.8.17"},
    ],
  },
  networks: {
    hardhat: {
      hardfork: "merge"
    }
  }
};

export default config;
