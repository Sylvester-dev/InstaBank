const { expect } = require("chai");
const { testEnv } = require('../test_suite_setup/setup');
const { ProtocolErrors } = require("../test_suite_setup/errors");
const { toWei, toEther, customPrint } = require("../test_suite_setup/helpers");
const { MAX_UINT } = require("../test_suite_setup/constants");
// Run after deposit
require('./deposit.test')

describe("Lending Pool :: Borrow", function () {
    before("User 1 deposits 100 LINK", async function () {
        const { users, lendingPool, dai, link } = testEnv;

        // One time infinite approve
        const approveLinkTx = await link.connect(users[1].signer).approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 1 infinite approves the lendingPool for LINK reserve");

        const linkTx = await lendingPool.connect(users[1].signer).deposit(
            link.address,
            toWei(100),
            users[1].address
        )
        await linkTx.wait()

        customPrint("User 1 deposits 100 LINK");
    })

    it("Tries to borrow invalid asset and amount", async function () {
        const { deployer, addressesProvider, lendingPool, link } = testEnv;
        const { VL_INVALID_AMOUNT, VL_INVALID_ASSET } = ProtocolErrors;

        // Invalid asset
        await expect(lendingPool.borrow(
            await addressesProvider.DAI_TO_ETH(),
            toWei(1),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_ASSET
        );

        // Invalid amount
        await expect(lendingPool.borrow(
            link.address,
            toWei(0),
            deployer.address
        )).to.be.revertedWith(
            VL_INVALID_AMOUNT
        );
    });

    it("Gets max borrow amount using collateral and LTV", async function () {
        const { deployer, protocolDataProvider, link } = testEnv;

        const userReserveData = await protocolDataProvider.getUserReserveData(
            link.address,
            deployer.address
        )

        // LTV is 70% for bronze user and mock LINK and DAI price is same
        expect(toEther(userReserveData.availableToBorrow)).to.equal(70, "Invalid max available borrow");
    });

    it("Tries to borrow more than LTV", async function () {
        const { deployer, lendingPool, link } = testEnv;
        const { VL_COLLATERAL_CANNOT_COVER_NEW_BORROW } = ProtocolErrors;

        await expect(lendingPool.borrow(
            link.address,
            toWei(75.1),
            deployer.address
        )).to.be.revertedWith(
            VL_COLLATERAL_CANNOT_COVER_NEW_BORROW
        );
    });

    it("Checks if borrowing set to true, equal debtTokens minted and borrowed tokens received after a valid borrow", async function () {
        const { deployer, lendingPool, protocolDataProvider, link, dLink } = testEnv;

        const linkBalanceBefore = toEther(await link.balanceOf(deployer.address))

        const Tx = await lendingPool.borrow(
            link.address,
            toWei(10),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 borrows 10 LINK against DAI as collateral");

        const userConfig = await protocolDataProvider.getUserReserveData(link.address, deployer.address);
        const dLinkBalance = toEther(await dLink.balanceOf(deployer.address))
        const linkBalanceAfter = toEther(await link.balanceOf(deployer.address))

        expect(userConfig.isBorrowed).to.equal(true, "Borrowing not set true");
        expect(dLinkBalance).to.equal(10, "Incorrect Debt Tokens minted")
        expect(linkBalanceAfter).to.equal(linkBalanceBefore + 10, "Incorrect funds borrowed")
    });

    it("Checks if state, interest rates updated in a valid borrow", async function () {
        const { deployer, lendingPool, link } = testEnv;

        const reserveBefore = await lendingPool.getReserveData(link.address)

        const Tx = await lendingPool.borrow(
            link.address,
            toWei(10),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 borrows 10 LINK against DAI as collateral");

        const reserveAfter = await lendingPool.getReserveData(link.address)

        expect(reserveBefore.lastUpdateTimestamp)
            .to.be.below(reserveAfter.lastUpdateTimestamp, "Timestamp not updated")
        expect(reserveBefore.liquidityIndex)
            .to.be.below(reserveAfter.liquidityIndex, "Liquidity index not updated")
        expect(reserveBefore.variableBorrowIndex)
            .to.be.below(reserveAfter.variableBorrowIndex, "Variable Borrow index not updated")
        expect(reserveBefore.currentLiquidityRate)
            .to.be.below(reserveAfter.currentLiquidityRate, "Liquidity Rate not updated")
        expect(reserveBefore.currentVariableBorrowRate)
            .to.be.below(reserveAfter.currentVariableBorrowRate, "Variable Borrow Rate not updated")

    });

    it("Tries to withdraw while used as collateral", async function () {
        const { deployer, lendingPool, protocolDataProvider, dai, aDai } = testEnv;
        const { VL_TRANSFER_NOT_ALLOWED } = ProtocolErrors;

        await expect(lendingPool.withdraw(
            dai.address,
            MAX_UINT,
            deployer.address
        )).to.be.revertedWith(VL_TRANSFER_NOT_ALLOWED)
    });

});
