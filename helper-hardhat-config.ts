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
        lotteryToken: "0x97cdf8AfD135a6DCb1BA07DAfcc0Aa3ef1CE6cd4",
        lottery: "0x9f64ab5fdD0919c6E777B07283afC88D93E785f4",
    },

    1: {
        name: "mainnet",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6