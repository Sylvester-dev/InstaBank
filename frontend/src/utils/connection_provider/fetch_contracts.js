import { ethers } from "ethers";
import { supportedNetworks } from "./network_config";

import AddressesProvider from "../../artifacts/contracts/AddressesProvider.sol/AddressesProvider.json";
import ProtocolDataProvider from "../../artifacts/contracts/data_provider/ProtocolDataProvider.sol/ProtocolDataProvider.json";
import WalletBalanceProvider from "../../artifacts/contracts/data_provider/WalletBalanceProvider.sol/WalletBalanceProvider.json";
import LendingPool from "../../artifacts/contracts/lendingpool/LendingPool.sol/LendingPool.json";
import RefiCollection from "../../artifacts/contracts/tokenization/RefiCollection.sol/RefiCollection.json";
import WETHGateway from "../../artifacts/contracts/utils/WETHGateway.sol/WETHGateway.json";
import ERC20 from "../../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json";
import aToken from "../../artifacts/contracts/tokenization/AToken.sol/AToken.json";
import MockWETH from "../../artifacts/contracts/mocks/MockWETH.sol/MockWETH.json";
import dToken from "../../artifacts/contracts/tokenization/VariableDebtToken.sol/VariableDebtToken.json";

const fetchContracts = async (provider, chainId) => {
  const addressProvider = new ethers.Contract(
    supportedNetworks[chainId].address,
    AddressesProvider.abi,
    provider
  );

  const protocolDataProvider = new ethers.Contract(
    await addressProvider.protocolDataProvider(),
    ProtocolDataProvider.abi,
    provider
  );

  const walletBalanceProvider = new ethers.Contract(
    await addressProvider.walletBalanceProvider(),
    WalletBalanceProvider.abi,
    provider
  );

  const lendingPoolContract = new ethers.Contract(
    await addressProvider.getLendingPool(),
    LendingPool.abi,
    provider
  );

  const refiCollectionContract = new ethers.Contract(
    await addressProvider.getRefiCollection(),
    RefiCollection.abi,
    provider
  )

  const wETHGatewayContract = new ethers.Contract(
    await addressProvider.getWETHGateway(),
    WETHGateway.abi,
    provider
  );

  const daiContract = new ethers.Contract(
    await addressProvider.DAI(),
    ERC20.abi,
    provider
  );

  const linkContract = new ethers.Contract(
    await addressProvider.LINK(),
    ERC20.abi,
    provider
  );

  const aTokens = await protocolDataProvider.getAllATokens();

  const wethContract = new ethers.Contract(
    await addressProvider.WETH(),
    MockWETH.abi,
    provider
  );

  const awethAddress = aTokens.find(
    (aToken) => aToken.symbol === "aWETH"
  ).tokenAddress;

  const awethContract = new ethers.Contract(awethAddress, aToken.abi, provider);

  const dwethAddress = (
    await protocolDataProvider.getReserveTokensAddresses(wethContract.address)
  ).variableDebtTokenAddress;

  const dwethContract = new ethers.Contract(dwethAddress, dToken.abi, provider);

  return {
    addressProvider,
    protocolDataProvider,
    walletBalanceProvider,
    lendingPoolContract,
    refiCollectionContract,
    wETHGatewayContract,
    daiContract,
    linkContract,
    wethContract,
    awethContract,
    dwethContract,
  };
};

export { fetchContracts };
