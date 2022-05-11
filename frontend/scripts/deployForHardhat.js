// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Deploy WadRayMath Library for linking purpose
  const WadRayMath = await hre.ethers.getContractFactory("WadRayMath");
  const wadRayMath = await WadRayMath.deploy();
  await wadRayMath.deployed();

  // Deploy ReserveLogic Library for linking purpose
  const ReserveLogic = await hre.ethers.getContractFactory("ReserveLogic");
  const reserveLogic = await ReserveLogic.deploy();
  await reserveLogic.deployed();

  // Deploy GenericLogic Library for linking purpose
  const GenericLogic = await hre.ethers.getContractFactory("GenericLogic");
  const genericLogic = await GenericLogic.deploy();
  await genericLogic.deployed();

  // Deploy ValidationLogic Library for linking purpose
  const ValidationLogic = await hre.ethers.getContractFactory(
    "ValidationLogic",
    {
      libraries: {
        GenericLogic: genericLogic.address,
      },
    }
  );
  const validationLogic = await ValidationLogic.deploy();
  await validationLogic.deployed();

  // Deploy ReputationLogic Library for linking purpose
  const ReputationLogic = await hre.ethers.getContractFactory(
    "ReputationLogic"
  );
  const reputationLogic = await ReputationLogic.deploy();
  await reputationLogic.deployed();

  // Deploy AddressesProvider contract
  const AddressesProvider = await hre.ethers.getContractFactory(
    "AddressesProvider",
    {
      libraries: {
        ReserveLogic: reserveLogic.address,
        ValidationLogic: validationLogic.address,
        WadRayMath: wadRayMath.address,
        ReputationLogic: reputationLogic.address,
      },
    }
  );

  const addressesProvider = await AddressesProvider.deploy();
  await addressesProvider.deployed();

  console.log("AddressesProvider deployed to:", addressesProvider.address);

  // For UI testing
  testEnv.addressesProvider = addressesProvider;
  await setupEnvironment();
  await setupData();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// For UI testing

const MAX_UINT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const toWei = (num) => {
  return hre.ethers.utils.parseEther(num.toString());
};

const testEnv = {
  deployer: {},
  users: [],
  addressesProvider: {},
  lendingPool: {},
  wethGateway: {},
  priceOracle: {},
  protocolDataProvider: {},
  walletBalanceProvider: {},
  weth: {},
  aWeth: {},
  dWeth: {},
  dai: {},
  aDai: {},
  dDai: {},
  link: {},
  aLink: {},
  dLink: {},
};

const setupEnvironment = async () => {
  const [_deployer, ...restSigners] = await hre.ethers.getSigners();
  const deployer = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;

  testEnv.lendingPool = await hre.ethers.getContractAt(
    "LendingPool",
    await testEnv.addressesProvider.getLendingPool()
  );
  testEnv.wethGateway = await hre.ethers.getContractAt(
    "WETHGateway",
    await testEnv.addressesProvider.getWETHGateway()
  );
  testEnv.priceOracle = await hre.ethers.getContractAt(
    "PriceOracle",
    await testEnv.addressesProvider.getPriceOracle()
  );

  testEnv.protocolDataProvider = await hre.ethers.getContractAt(
    "ProtocolDataProvider",
    await testEnv.addressesProvider.protocolDataProvider()
  );
  testEnv.walletBalanceProvider = await hre.ethers.getContractAt(
    "WalletBalanceProvider",
    await testEnv.addressesProvider.walletBalanceProvider()
  );

  const wethAddress = await testEnv.addressesProvider.WETH();
  const daiAddress = await testEnv.addressesProvider.DAI();
  const linkAddress = await testEnv.addressesProvider.LINK();

  testEnv.weth = await hre.ethers.getContractAt("MockWETH", wethAddress);
  testEnv.dai = await hre.ethers.getContractAt("MockERC20", daiAddress);
  testEnv.link = await hre.ethers.getContractAt("MockERC20", linkAddress);

  const aTokens = await testEnv.protocolDataProvider.getAllATokens();

  const aWEthAddress = aTokens.find(
    (aToken) => aToken.symbol === "aWETH"
  ).tokenAddress;
  const aDaiAddress = aTokens.find(
    (aToken) => aToken.symbol === "aDAI"
  ).tokenAddress;
  const aLinkAddress = aTokens.find(
    (aToken) => aToken.symbol === "aLINK"
  ).tokenAddress;

  testEnv.aWeth = await hre.ethers.getContractAt("AToken", aWEthAddress);
  testEnv.aDai = await hre.ethers.getContractAt("AToken", aDaiAddress);
  testEnv.aLink = await hre.ethers.getContractAt("AToken", aLinkAddress);

  const dWethAddress = (
    await testEnv.protocolDataProvider.getReserveTokensAddresses(
      testEnv.weth.address
    )
  ).variableDebtTokenAddress;
  const dDaiAddress = (
    await testEnv.protocolDataProvider.getReserveTokensAddresses(
      testEnv.dai.address
    )
  ).variableDebtTokenAddress;
  const dLinkAddress = (
    await testEnv.protocolDataProvider.getReserveTokensAddresses(
      testEnv.link.address
    )
  ).variableDebtTokenAddress;

  testEnv.dWeth = await hre.ethers.getContractAt(
    "VariableDebtToken",
    dWethAddress
  );
  testEnv.dDai = await hre.ethers.getContractAt(
    "VariableDebtToken",
    dDaiAddress
  );
  testEnv.dLink = await hre.ethers.getContractAt(
    "VariableDebtToken",
    dLinkAddress
  );
};

const setupData = async () => {
  const { deployer, users, dai, link, aWeth, lendingPool, wethGateway } =
    testEnv;
  // deployer != users[0]

  console.log("Deployer -> ", deployer.address);
  console.log("User 0 -> ", users[0].address);
  console.log("User 1 -> ", users[1].address);

  // Load 3 user accounts with mock DAI and LINK
  await dai.mint(deployer.address, toWei(1000));
  await link.mint(deployer.address, toWei(1000));

  await dai.connect(users[0].signer).mint(users[0].address, toWei(1000));
  await link.connect(users[0].signer).mint(users[0].address, toWei(1000));

  await dai.connect(users[1].signer).mint(users[1].address, toWei(1000));
  await link.connect(users[1].signer).mint(users[1].address, toWei(1000));

  const approveDaiTx = await dai.approve(lendingPool.address, MAX_UINT);
  await approveDaiTx.wait();

  console.log("Deployer infinite approves the lendingPool for DAI reserve");

  const depositDaiTx = await lendingPool.deposit(
    dai.address,
    toWei(100),
    deployer.address
  );
  await depositDaiTx.wait();

  console.log("Deployer deposits 100 DAI");

  // One time infinite approve
  const approveLinkTx = await link
    .connect(users[0].signer)
    .approve(lendingPool.address, MAX_UINT);
  await approveLinkTx.wait();

  console.log("User 0 infinite approves the lendingPool for LINK reserve");

  const linkTx = await lendingPool
    .connect(users[0].signer)
    .deposit(link.address, toWei(100), users[0].address);
  await linkTx.wait();

  console.log("User 0 deposits 100 LINK");

  const borrowLinkTx = await lendingPool
    .connect(users[0].signer).borrow(
      dai.address,
      toWei(50),
      users[0].address
    );
  await borrowLinkTx.wait();

  // console.log("Deployer borrows 60 LINK against DAI as collateral");

  // // One time infinite approve aWeth
  // // Required at withdrawal time. i.e. do this before ETH deposit
  // const approveAWethTx = await aWeth
  //   .connect(users[0].signer)
  //   .approve(wethGateway.address, MAX_UINT);
  // await approveAWethTx.wait();

  // console.log("User 0 infinite approves the wEthGateway for aWeth tokens");

  // const Tx = await wethGateway
  //   .connect(users[0].signer)
  //   .depositETH({ value: toWei(10) });
  // await Tx.wait();

  // console.log("User 0 deposits 10 ETH");
};
