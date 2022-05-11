const { expect } = require("chai");
const { testEnv } = require('../test_suite_setup/setup');
const { ProtocolErrors } = require("../test_suite_setup/errors");
const { toWei, toEther, customPrint } = require("../test_suite_setup/helpers");
const { MAX_UINT } = require("../test_suite_setup/constants");
// Run after borrow
require('./borrow.test')

describe("Lending Pool :: Repay", function () {

    it("Tries to repay invalid asset and amount", async function () {
        const { deployer, addressesProvider, lendingPool, dai } = testEnv;
        const { VL_INVALID_AMOUNT, VL_INVALID_ASSET } = ProtocolErrors;

        // Invalid asset
        await expect(lendingPool.repay(
            await addressesProvider.DAI_TO_ETH(),
            toWei(1),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_ASSET
        );

        // Invalid amount
        await expect(lendingPool.repay(
            dai.address,
            toWei(0),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_AMOUNT
        );
    });

    it("Tries to repay asset which isn't borrowed", async function () {
        const { deployer, lendingPool, dai } = testEnv;
        const { VL_NO_DEBT_OF_SELECTED_TYPE } = ProtocolErrors;

        await expect(lendingPool.repay(
            dai.address,
            toWei(100),
            deployer.address
        )).to.be.revertedWith(
            VL_NO_DEBT_OF_SELECTED_TYPE
        );
    });

    it("Checks if equal debtTokens burned and repaid tokens received after a valid repay", async function () {
        const { deployer, lendingPool, link, aLink, dLink } = testEnv;

        const linkBalanceBefore = toEther(await link.balanceOf(aLink.address))

        // One time infinite approve
        const approveLinkTx = await link.approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 0 infinite approves the lendingPool for LINK reserve");

        const Tx = await lendingPool.repay(
            link.address,
            toWei(10),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 repays 10 LINK");

        const dLinkBalance = toEther(await dLink.balanceOf(deployer.address))
        const linkBalanceAfter = toEther(await link.balanceOf(aLink.address))

        // Considering interest accured over period
        expect(dLinkBalance).to.be.above(10, "Incorrect Debt Tokens burned")
        expect(linkBalanceAfter).to.equal(linkBalanceBefore + 10, "Incorrect funds repaid")
    });

    it("Checks if state, interest rates updated in a valid borrow", async function () {
        const { deployer, lendingPool, link } = testEnv;

        const reserveBefore = await lendingPool.getReserveData(link.address)

        const Tx = await lendingPool.repay(
            link.address,
            toWei(5),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 repays 5 LINK loan");

        const reserveAfter = await lendingPool.getReserveData(link.address)

        expect(reserveBefore.lastUpdateTimestamp)
            .to.be.below(reserveAfter.lastUpdateTimestamp, "Timestamp not updated")
        expect(reserveBefore.liquidityIndex)
            .to.be.below(reserveAfter.liquidityIndex, "Liquidity index not updated")
        expect(reserveBefore.variableBorrowIndex)
            .to.be.below(reserveAfter.variableBorrowIndex, "Variable Borrow index not updated")
        expect(reserveBefore.currentLiquidityRate)
            .to.be.above(reserveAfter.currentLiquidityRate, "Liquidity Rate not updated")
        expect(reserveBefore.currentVariableBorrowRate)
            .to.be.above(reserveAfter.currentVariableBorrowRate, "Variable Borrow Rate not updated")
    });

    it("Checks if borrowing set to false after a full repay", async function () {
        const { deployer, lendingPool, protocolDataProvider, link, dLink } = testEnv;

        const linkBalanceBefore = toEther(await link.balanceOf(deployer.address))

        // Repay any amount more than borrowed for a full repay
        const Tx = await lendingPool.repay(
            link.address,
            toWei(100),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 repays entire LINK loan");

        const userConfig = await protocolDataProvider.getUserReserveData(link.address, deployer.address);
        const dLinkBalance = toEther(await dLink.balanceOf(deployer.address))
        const linkBalanceAfter = toEther(await link.balanceOf(deployer.address))

        expect(userConfig.isBorrowed).to.equal(false, "Borrowing not set false");
        expect(dLinkBalance).to.equal(0, "Incorrect Debt Tokens burned")
        // Considering interest paid
        expect(linkBalanceAfter).to.be.below(linkBalanceBefore - 5, "Incorrect funds repaid")
    });

});
