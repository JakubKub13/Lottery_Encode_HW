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
        
    },

    5: {
        name: "goerli",
        lottery: "0x9f64ab5fdD0919c6E777B07283afC88D93E785f4",
    },

    80001: {
        name: "mumbai",
        lottery: "0x9d2fec87a87E00d4BED4fC769180EA73725170EA"
    },

    1: {
        name: "mainnet",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6