## Introduction

Refi, (Reputation + Finance) is a variable interest rate lending and borrowing protocol that maintains a credit score for its users and provides benefits to them accordingly. It also issues on-chain credit cards to users for easy external payments. Refi takes its core functionality from [AAVE v2](https://github.com/aave/protocol-v2).

## Documentation

### Branches

1. master - This branch contains the frontend, subgraph and smart contracts for the Refi protocol on multiple chains. To test the protocol locally on hardhat, see [this](#installation)
2. min-aave - This branch is a minimal implementation of AAVE v2 i.e. it only supports variable rate lending and borrowing. It is integrated with frontend and you can also test this implementation using below instructions.

### Installation

`npm install` in root directory

### Initial Setup

Create a config.json file in the root directory with the following content
```
{   
    "mumbaiPrivateKey": "**YOUR_MUMBAI_TESTNET_ACCOUNT_PRIVATE_KEY**",
    "rinkebyPrivateKey1": "**YOUR_RINKEBY_ACCOUNT_PRIVATE_KEY**",
    "rinkebyPrivateKey2": "**YOUR_ANOTHER_RINKEBY_ACCOUNT_PRIVATE_KEY**",
    "rinkebyRPCUrl": "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
}
```
### To run tests

Run `npx hardhat test` in the root directory

### To run locally on Hardhat

First, you will need to add the following environment variable to your .env file in the root folder

`REACT_APP_IMAGE_KEY`

This is the API token to access your NFT.Storage service. [Know more](https://nft.storage/docs/)   

Now, Open three terminals in root directory

First run `npx hardhat node` in one terminal

You can then copy the private keys of some of the accounts
from the console and import it in your browser wallet e.g. MetaMask
so that you can interact with the application. The network details are 
also shown in the console which you can use to add the local network in your wallet 
if not already present.

Then run `npx hardhat run scripts/deployForHardhat.js --network localhost` in the second terminal.

Copy the address of the deployed AddressesProvider contract from console.

Open the network_config.js file in **src/utils/connection_provider/network_config.js** file. Paste the copied address in the address field of Hardhat.

Finally run `npm run start` in third terminal.

