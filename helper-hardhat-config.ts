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
        lottery: "0x660535218050C2860250C68df9d47b5eB0C49aA5",
        lotteryToken: "0xd212B4C2FB54A4C3C35f4EADaf3B329Ae93bB86C"
    },
    1: {
        name: "mainnet",
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6