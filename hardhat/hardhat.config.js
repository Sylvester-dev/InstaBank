require("@nomiclabs/hardhat-waffle");



const INFURA_PROJECT_ID = "98b0477e69b1415cbaf0c6b49da3206a";

module.exports = {
  solidity: { compilers: [{ version: "0.7.6" }, { version: "0.7.2" } , { version: "0.8.2" } ] },
  hardhat: {
    forking: {
      url:
        "https://eth-mainnet.alchemyapi.io/v2/isjc2sza8ZV0h7V2nNh4Iiey9Y_k6EoW",
    },
  },
  networks: {
    
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [
        "0x59f869a48bf71e6a556bf803d0d196453cef3808377b509a5907dcb22c4515b5",
        `0x8d299331334dcd725631b528dc1c4823d4a4cf763436372046b6ac9024469cf0`,
        `0x66ab101121ed2c31dfe8cbc87c582dbe2c43c37ddbe246f5b5eeaa11d9cc6a41`,
      ],
      chainId: 4,
    },
  },
};