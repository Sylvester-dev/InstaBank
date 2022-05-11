require("@nomiclabs/hardhat-waffle");
// require("hardhat-gas-reporter");

const config = require("./config.json");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [config.mumbaiPrivateKey],
      gasPrice: 20e9,
      gas: 15e6,
    },
    rinkeby: {
      url: config.rinkebyRPCUrl,
      accounts: [config.rinkebyPrivateKey1, config.rinkebyPrivateKey2],
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
  // gasReporter: {
  //   currency: 'USD',
  //   gasPrice: 50
  // }
};
