const { expect } = require("chai");
const { testEnv } = require('../test_suite_setup/setup');
const { ProtocolErrors } = require("../test_suite_setup/errors");
const { toWei, toEther, customPrint } = require("../test_suite_setup/helpers");
const { MAX_UINT } = require("../test_suite_setup/constants");
// Run after price_oracle
require('../price_oracle.test')

describe("Lending Pool :: Deposit", function () {

    it("Tries to deposit invalid asset and amount", async function () {
        const { deployer, addressesProvider, lendingPool, dai } = testEnv;
        const { VL_INVALID_AMOUNT, VL_INVALID_ASSET } = ProtocolErrors;

        // Invalid asset
        await expect(lendingPool.deposit(
            await addressesProvider.DAI_TO_ETH(),
            toWei(1),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_ASSET
        );

        // Invalid amount
        await expect(lendingPool.deposit(
            dai.address,
            toWei(0),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_AMOUNT
        );
    });

    it("Tries to deposit more than wallet balance", async function () {
        const { deployer, lendingPool, dai } = testEnv;
        const { ET_AMOUNT_EXCEEDS_BALANCE } = ProtocolErrors;

        // One time infinite approve
        const approveTx = await dai.approve(lendingPool.address, MAX_UINT);
        await approveTx.wait();

        customPrint("User 0 infinite approves the lendingPool for DAI reserve");

        await expect(lendingPool.deposit(
            dai.address,
            toWei(10000),
            deployer.address
        )).to.be.revertedWith(
            ET_AMOUNT_EXCEEDS_BALANCE
        );
    });

    // State and interest rates are not updated in first deposit
    it("Checks if collateral set to true and equal aTokens minted after a valid 1st deposit", async function () {
        const { deployer, lendingPool, protocolDataProvider, dai, aDai } = testEnv;

        const reserveBefore = await lendingPool.getReserveData(dai.address)

        const Tx = await lendingPool.deposit(
            dai.address,
            toWei(100),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 deposits 100 DAI");

        const reserveAfter = await lendingPool.getReserveData(dai.address)
        const userData = await lendingPool.getUserAccountData(deployer.address)
        const userConfig = await protocolDataProvider.getUserReserveData(dai.address, deployer.address);
        const aDaiBalance = toEther(await aDai.balanceOf(deployer.address))

        expect(reserveBefore.lastUpdateTimestamp)
            .to.be.below(reserveAfter.lastUpdateTimestamp, "Timestamp not updated")
        expect(userConfig.usageAsCollateralEnabled).to.equal(true, "Collateral not set true");
        expect(toEther(userData.totalCollateralETH)).to.equal(50, "Invalid collateral amount")
        expect(aDaiBalance).to.equal(100, "ATokens not minted to user")
    });

});
