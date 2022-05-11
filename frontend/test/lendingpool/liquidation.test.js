const { expect } = require("chai");
const { testEnv } = require('../test_suite_setup/setup');
const { toWei, toEther, customPrint } = require("../test_suite_setup/helpers");
const { MAX_UINT } = require("../test_suite_setup/constants");
// Run after lendingpool/withdraw
require('./withdraw.test')

describe("Lending Pool : Liquidation", function () {

    before("User 0 deposits 100 DAI and User 1 deposits 100 LINK", async function () {
        const { deployer, users, priceOracle, lendingPool, dai, link } = testEnv;

        // One time infinite approve DAI
        const approveDaiTx = await dai.approve(lendingPool.address, MAX_UINT);
        await approveDaiTx.wait();

        customPrint("User 0 infinite approves the lendingPool for DAI reserve");

        const daiTx = await lendingPool.deposit(
            dai.address,
            toWei(100),
            deployer.address
        )
        await daiTx.wait()

        customPrint("User 0 deposits 100 DAI");

        // One time infinite approve DAI
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

        const borrowLinkTx = await lendingPool.borrow(
            link.address,
            toWei(70),
            deployer.address
        )
        await borrowLinkTx.wait()

        customPrint("User 0 borrows max available i.e. 70 LINK");

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);

        // Initially DAI price == LINK price == 0.5 ETH
        // Simulated increase in LINK price by 8% which should take the health factor below 1
        const Tx = await linkSource.setPrice(toWei(0.54));
        await Tx.wait();

        customPrint("Simulated increase in LINK price by 8%")
    })

    it("Checks getters required for frontend calculation", async function () {
        const { deployer, priceOracle, protocolDataProvider, dai, link } = testEnv;

        const daiPriceInEth = toEther(await priceOracle.getAssetPrice(dai.address));
        const linkPriceInEth = toEther(await priceOracle.getAssetPrice(link.address));

        expect(daiPriceInEth).to.equal(0.5, "Wrong Price for DAI")
        expect(linkPriceInEth).to.equal(0.54, "Wrong Price for LINK")

        const userReserveData = await protocolDataProvider.getUserReserveData(link.address, deployer.address)

        expect(toEther(userReserveData.currentATokenBalance)).to.equal(0, "Invalid currentATokenBalance");
        expect(toEther(userReserveData.currentVariableDebt)).to.be.above(70, "Invalid currentVariableDebt");
        expect(toEther(userReserveData.healthFactor)).to.be.below(1, "Health factor not set");
    });

    it("Tests normal liquidation", async function () {
        const { deployer, users, lendingPool, dai, aDai, link, dLink, aLink } = testEnv;

        const approveLinkTx = await link.connect(users[2].signer).approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 2 infinite approves the lendingPool for LINK reserve");

        const dLinkBalanceBefore = toEther(await dLink.balanceOf(deployer.address))
        const aDaiBalanceBefore = toEther(await aDai.balanceOf(deployer.address))

        const linkReserveBefore = await lendingPool.getReserveData(link.address)
        const daiReserveBefore = await lendingPool.getReserveData(dai.address)

        const liquidatorLinkBalanceBefore = toEther(await link.balanceOf(users[2].address));
        const liquidatorDaiBalanceBefore = toEther(await dai.balanceOf(users[2].address));
        const linkPoolLiquidityBefore = toEther(await link.balanceOf(aLink.address));
        const daiPoolLiquidityBefore = toEther(await dai.balanceOf(aDai.address));

        const Tx = await lendingPool.connect(users[2].signer).liquidationCall(
            dai.address,
            link.address,
            deployer.address,
            MAX_UINT,
            false
        )
        await Tx.wait()

        customPrint("User 2 liquidates the unhealthy position");

        const dLinkBalanceAfter = toEther(await dLink.balanceOf(deployer.address))
        customPrint("User 0 has remaining debt of " + dLinkBalanceAfter + "LINK after liquidation");

        const aDaiBalanceAfter = toEther(await aDai.balanceOf(deployer.address))
        customPrint("User 0 has remaining collateral of " + aDaiBalanceAfter + "DAI after liquidation");

        const linkReserveAfter = await lendingPool.getReserveData(link.address)
        const daiReserveAfter = await lendingPool.getReserveData(dai.address)

        const liquidatorLinkBalanceAfter = toEther(await link.balanceOf(users[2].address));
        const liquidatorDaiBalanceAfter = toEther(await dai.balanceOf(users[2].address));
        const linkPoolLiquidityAfter = toEther(await link.balanceOf(aLink.address));
        const daiPoolLiquidityAfter = toEther(await dai.balanceOf(aDai.address));

        // Check Debt tokens burned
        expect(dLinkBalanceAfter).to.be.below(dLinkBalanceBefore, "Debt tokens not burnt");

        // Check updated state, interest rates for both reserves
        expect(linkReserveBefore.lastUpdateTimestamp)
            .to.be.below(linkReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Debt Reserve")
        expect(linkReserveBefore.liquidityIndex)
            .to.be.below(linkReserveAfter.liquidityIndex, "Liquidity index not updated for Debt Reserve")
        expect(linkReserveBefore.variableBorrowIndex)
            .to.be.below(linkReserveAfter.variableBorrowIndex, "Variable Borrow index not updated for Debt Reserve")
        expect(linkReserveBefore.currentLiquidityRate)
            .to.be.above(linkReserveAfter.currentLiquidityRate, "Liquidity Rate not updated for Debt Reserve")
        expect(linkReserveBefore.currentVariableBorrowRate)
            .to.be.above(linkReserveAfter.currentVariableBorrowRate, "Variable Borrow Rate not updated for Debt Reserve")

        expect(daiReserveBefore.lastUpdateTimestamp)
            .to.be.below(daiReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Collateral Reserve")

        // Check AToken burn
        expect(aDaiBalanceAfter).to.be.below(aDaiBalanceBefore, "ATokens tokens not burnt");

        // Check asset transfer
        expect(liquidatorLinkBalanceAfter).to.be.below(liquidatorLinkBalanceBefore - 35, "Invalid liquidator LINK balance")
        expect(liquidatorDaiBalanceAfter).to.be.above(liquidatorDaiBalanceBefore, "Invalid liquidator DAI balance")
        expect(daiPoolLiquidityAfter).to.be.below(daiPoolLiquidityBefore, "Invalid DAI liquidity")
        expect(linkPoolLiquidityAfter).to.be.above(linkPoolLiquidityBefore, "Invalid LINK liquidity")
    });

    it("Tests liquidation with recieveAToken=true", async function () {
        const { deployer, users, priceOracle, lendingPool, dLink, dai, aDai, link } = testEnv;

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);

        const linkSourceTx = await linkSource.setPrice(toWei(1));
        await linkSourceTx.wait();

        customPrint("Simulated increase in LINK price by 100%")

        const linkReserveBefore = await lendingPool.getReserveData(link.address)
        const daiReserveBefore = await lendingPool.getReserveData(dai.address)

        const dLinkBalanceBefore = toEther(await dLink.balanceOf(deployer.address))
        const liquidatorADaiBalanceBefore = toEther(await aDai.balanceOf(users[2].address));

        const Tx = await lendingPool.connect(users[2].signer).liquidationCall(
            dai.address,
            link.address,
            deployer.address,
            MAX_UINT,
            true
        )
        await Tx.wait()

        customPrint("User 2 liquidates the unhealthy position");

        const dLinkBalanceAfter = toEther(await dLink.balanceOf(deployer.address))
        customPrint("User 0 has remaining debt of " + dLinkBalanceAfter + "LINK after liquidation");

        const aDaiBalanceAfter = toEther(await aDai.balanceOf(deployer.address))
        customPrint("User 0 has remaining collateral of " + aDaiBalanceAfter + "DAI after liquidation");

        const linkReserveAfter = await lendingPool.getReserveData(link.address)
        const daiReserveAfter = await lendingPool.getReserveData(dai.address)

        const liquidatorADaiBalanceAfter = toEther(await aDai.balanceOf(users[2].address));

        // Check updated state, interest rates for only debt reserve
        expect(linkReserveBefore.lastUpdateTimestamp)
            .to.be.below(linkReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Debt Reserve")
        expect(linkReserveBefore.liquidityIndex)
            .to.be.below(linkReserveAfter.liquidityIndex, "Liquidity index not updated for Debt Reserve")
        expect(linkReserveBefore.variableBorrowIndex)
            .to.be.below(linkReserveAfter.variableBorrowIndex, "Variable Borrow index not updated for Debt Reserve")
        expect(linkReserveBefore.currentLiquidityRate)
            .to.be.above(linkReserveAfter.currentLiquidityRate, "Liquidity Rate not updated for Debt Reserve")
        expect(linkReserveBefore.currentVariableBorrowRate)
            .to.be.above(linkReserveAfter.currentVariableBorrowRate, "Variable Borrow Rate not updated for Debt Reserve")

        expect(daiReserveBefore.lastUpdateTimestamp)
            .to.equal(daiReserveAfter.lastUpdateTimestamp, "Timestamp updated for Collateral Reserve")

        // Check AToken transfer
        expect(liquidatorADaiBalanceAfter).to.be.above(liquidatorADaiBalanceBefore, "ATokens tokens not transferred");

        // Check Debt tokens burned
        expect(dLinkBalanceAfter).to.be.below(dLinkBalanceBefore, "Debt tokens not burnt");
    });

    it("Resets the protocol after liquidation", async function () {
        const { deployer, users, priceOracle, lendingPool, dai, link } = testEnv;

        // One time infinite approve
        const approveLinkTx = await link.approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 0 infinite approves the lendingPool for LINK reserve");

        const Tx = await lendingPool.repay(
            link.address,
            toWei(100),
            deployer.address
        )
        await Tx.wait()

        customPrint("User 0 repays entire LINK loan");

        const withdrawLinkTx = await lendingPool.connect(users[1].signer).withdraw(
            link.address,
            MAX_UINT,
            deployer.address
        )
        await withdrawLinkTx.wait()

        customPrint("User 1 withdraws all deposited LINK");

        const withdrawDaiTx = await lendingPool.withdraw(
            dai.address,
            MAX_UINT,
            deployer.address
        )
        await withdrawDaiTx.wait()

        customPrint("User 0 withdraws all deposited DAI");

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);
        const linkSourceTx = await linkSource.setPrice(toWei(0.5));
        await linkSourceTx.wait();

        customPrint("Simulated decrease in LINK price to its initial price")
    });

});
