export interface networkConfigItem {
    name?: string
    lotteryToken?: string 
    lottery?: string
  }
export interface networkConfigInfo {
    [key: number]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    31337: {
        name: "localhost",
        lotteryToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },

    5: {
        name: "goerli",
        lotteryToken: "0x9828c2Ad0A705F3E8D21FE31A1a5edBFDfc67e1f",
        lottery: "0xcC37F0a9Eb32cBC2b548A3e42F7711E6Bf368810",
    },

    1: {
        name: "mainnet",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6