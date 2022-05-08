const defaultChainId = 4;

const supportedNetworks = {
  // npx hardhat node
  // npx hardhat run scripts/deployForHardhat.js --network localhost
  // Copy console address
  31337: {
    name: "Hardhat",
    tokenSymbol: "ETH",
    rpcURL: "http://localhost:8545",
    address: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
  },
  // npx hardhat run scripts/deployForTestnet.js --network mumbai
  // Returned address is wrong. https://github.com/nomiclabs/hardhat/issues/2162.
  // Search your deployer address on polygonscan. Get contract from there
  80001: {
    name: "Mumbai",
    tokenSymbol: "MATIC",
    rpcURL: "https://rpc-mumbai.maticvigil.com",
    address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  // npx hardhat run scripts/deployForTestnet.js --network rinkeby
  // Copy console address
  4: {
    name: "Rinkeby",
    tokenSymbol: "ETH",
    rpcURL: "https://rinkeby-light.eth.linkpool.io/",
    address: "0xFaAcD658fe51552D7D64Ba530B60550F2Fd81a25",
  },
};

export { defaultChainId, supportedNetworks };
