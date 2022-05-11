const { expect } = require("chai");
const { testEnv } = require('../test_suite_setup/setup');
const { ProtocolErrors } = require("../test_suite_setup/errors");
const { customPrint, toWei, toEther } = require("../test_suite_setup/helpers");
const { MAX_UINT } = require("../test_suite_setup/constants");
// Run after repay
require('./repay.test')

describe("Lending Pool :: Withdraw", function () {

    it("Tries to withdraw invalid asset and amount", async function () {
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

    it("Tries to withdraw more than deposited balance", async function () {
        const { deployer, lendingPool, dai } = testEnv;
        const { VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE } = ProtocolErrors;

        await expect(lendingPool.withdraw(
            dai.address,
            toWei(10000),
            deployer.address
        )).to.be.revertedWith(
            VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE
        );
    });

    it("Checks if equal aTokens burned and deposit recieved after a valid withdrawal", async function () {
        const { deployer, lendingPool, dai, aDai } = testEnv;

        const beforeBalance = toEther(await dai.balanceOf(deployer.address))

        const Tx = await lendingPool.withdraw(
            dai.address,
            toWei(1),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 withdraws 1 dai");

        const afterBalance = toEther(await dai.balanceOf(deployer.address));
        const aDaiBalance = toEther(await aDai.balanceOf(deployer.address))

        // No interest since DAI wasn't borrowed by anyone
        expect(aDaiBalance).to.equal(99, "ATokens not burned")
        expect(afterBalance).to.equal(beforeBalance + 1, "Deposit not received")
    });

    it("Checks if collateral set to false after a valid full withdrawal", async function () {
        const { deployer, lendingPool, protocolDataProvider, dai, aDai } = testEnv;

        const Tx = await lendingPool.withdraw(
            dai.address,
            MAX_UINT,
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 withdraws all deposited dai");

        const userConfig = await protocolDataProvider.getUserReserveData(dai.address, deployer.address);
        const aDaiBalance = toEther(await aDai.balanceOf(deployer.address))

        expect(userConfig.usageAsCollateralEnabled).to.equal(false, "Collateral not set false");
        expect(aDaiBalance).to.equal(0, "ATokens not burned")
    });

    it("Checks if user recieved interest with withdrawal", async function () {
        const { deployer, users, lendingPool, protocolDataProvider, link, aLink } = testEnv;

        const beforeBalance = toEther(await link.balanceOf(users[1].address))

        const Tx = await lendingPool.connect(users[1].signer).withdraw(
            link.address,
            MAX_UINT,
            users[1].address
        )
        await Tx.wait()

        customPrint("User 1 withdraws all deposited LINK");

        const aLinkBalance = toEther(await aLink.balanceOf(users[1].address))
        const afterBalance = toEther(await link.balanceOf(users[1].address));

        // Interest is earned on LINK
        expect(afterBalance).to.be.above(beforeBalance + 1, "Deposit not received")
        expect(aLinkBalance).to.equal(0, "ATokens not burned")
    });
});
