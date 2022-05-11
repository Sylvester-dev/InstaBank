const { expect } = require("chai");
const { toEther, toWei } = require("./test_suite_setup/helpers");
const { testEnv, initializeSuite } = require('./test_suite_setup/setup');

describe("Test Environment Check", function () {
  before("Initialize Suite", async function () {
    await initializeSuite();
  });

  it("Checks Lending Pool is set up", async function () {
    const lendingPoolAddress = await testEnv.addressesProvider.getLendingPool();

    expect(lendingPoolAddress).to.not.equal(null);
    expect(lendingPoolAddress).to.equal(testEnv.lendingPool.address);
  });

  it("Checks Weth Gateway is set up", async function () {
    const wethGatewayAddress = await testEnv.addressesProvider.getWETHGateway();

    expect(wethGatewayAddress).to.not.equal(null);
    expect(wethGatewayAddress).to.equal(testEnv.wethGateway.address);
  });

  it("Checks Price Oracle is set up", async function () {
    const priceOracleAddress = await testEnv.addressesProvider.getPriceOracle();

    expect(priceOracleAddress).to.not.equal(null);
    expect(priceOracleAddress).to.equal(testEnv.priceOracle.address);
  });

  it("Checks ProtocolDataProvider is set up", async function () {
    const protocolDataProviderAddress = await testEnv.addressesProvider.protocolDataProvider();

    expect(protocolDataProviderAddress).to.not.equal(null);
    expect(protocolDataProviderAddress).to.equal(testEnv.protocolDataProvider.address);
  });

  it("Checks WalletBalanceProvider is set up", async function () {
    const walletBalanceProviderAddress = await testEnv.addressesProvider.walletBalanceProvider();

    expect(walletBalanceProviderAddress).to.not.equal(null);
    expect(walletBalanceProviderAddress).to.equal(testEnv.walletBalanceProvider.address);
  });

  it("Checks WETH reserve is set up", async function () {
    const wethAddress = await testEnv.addressesProvider.WETH();

    // Check Token exists
    expect(wethAddress).to.not.equal(null, "Token doesn't exist");
    expect(wethAddress).to.equal(testEnv.weth.address);

    // Check Price Oracle source
    expect(await testEnv.priceOracle.BASE_CURRENCY()).to.equal(wethAddress, "Invalid BASE_CURRENCY")

    // Check AToken exists
    expect(await testEnv.aWeth.UNDERLYING_ASSET_ADDRESS()).to.equal(wethAddress, "AToken doesn't exist");
  });

  it("Checks DAI reserve is set up", async function () {
    const daiAddress = await testEnv.addressesProvider.DAI();

    // Check Token exists
    expect(daiAddress).to.not.equal(null, "Token doesn't exist");
    expect(daiAddress).to.equal(testEnv.dai.address);

    // Check Price Oracle source
    expect(await testEnv.priceOracle.getSourceOfAsset(daiAddress))
      .to.equal(await testEnv.addressesProvider.DAI_TO_ETH(), "Invalid Price Source");

    // Check AToken exists
    expect(await testEnv.aDai.UNDERLYING_ASSET_ADDRESS()).to.equal(daiAddress, "AToken doesn't exist");
  });

  it("Checks LINK reserve is set up", async function () {
    const linkAddress = await testEnv.addressesProvider.LINK();

    // Check Token exists
    expect(linkAddress).to.not.equal(null, "Token doesn't exist");
    expect(linkAddress).to.equal(testEnv.link.address);

    // Check Price Oracle source
    expect(await testEnv.priceOracle.getSourceOfAsset(linkAddress))
      .to.equal(await testEnv.addressesProvider.LINK_TO_ETH(), "Invalid Price Source");

    // Check AToken exists
    expect(await testEnv.aLink.UNDERLYING_ASSET_ADDRESS()).to.equal(linkAddress, "AToken doesn't exist");
  });

  it("Checks if top 3 users hold 1000 DAI and 1000 LINK each", async function () {
    const { deployer, users, dai, link } = testEnv;

    // deployer == users[0]
    await dai.mint(deployer.address, toWei(1000));
    await link.mint(deployer.address, toWei(1000));

    await dai.connect(users[1].signer).mint(users[1].address, toWei(1000));
    await link.connect(users[1].signer).mint(users[1].address, toWei(1000));

    await dai.connect(users[2].signer).mint(users[2].address, toWei(1000));
    await link.connect(users[2].signer).mint(users[2].address, toWei(1000));

    const daiBalance = toEther(await dai.balanceOf(deployer.address));
    const linkBalance = toEther(await link.balanceOf(deployer.address));

    expect(daiBalance).to.equal(1000);
    expect(linkBalance).to.equal(1000);
  });
});
