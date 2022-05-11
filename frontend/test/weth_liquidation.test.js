const { expect } = require("chai");
const { testEnv } = require('./test_suite_setup/setup');
const { toWei, toEther, customPrint } = require("./test_suite_setup/helpers");
const { MAX_UINT } = require("./test_suite_setup/constants");
// Run after weth_gateway
require('./weth_gateway.test')

describe("WethGateway : Liquidation", function () {

    before("User 0 deposits 100 ETH and User 1 deposits 200 LINK", async function () {
        const { deployer, users, link, lendingPool, aWeth, dWeth, wethGateway } = testEnv;

        // One time infinite approve aWeth
        // Required at withdrawal time. i.e. do this before ETH deposit
        const approveAWethTx = await aWeth.approve(wethGateway.address, MAX_UINT);
        await approveAWethTx.wait();

        customPrint("User 0 infinite approves the wEthGateway for aWeth tokens");

        const depositEthTx = await wethGateway.depositETH({ value: toWei(100) })
        await depositEthTx.wait()

        customPrint("User 0 deposits 100 ETH");

        // One time infinite approve LINK
        const approveLinkTx = await link.connect(users[1].signer).approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 1 infinite approves the lendingPool for LINK reserve");

        const linkTx = await lendingPool.connect(users[1].signer).deposit(
            link.address,
            toWei(200),
            users[1].address
        )
        await linkTx.wait()

        customPrint("User 1 deposits 200 LINK");

        const approveDelegationTx = await dWeth.connect(users[1].signer).approveDelegation(wethGateway.address, toWei(75));
        await approveDelegationTx.wait()

        customPrint("User 1 approves WethGateway contract to borrow 70 ETH on behalf of itself");

        const borrowEthTx = await wethGateway.connect(users[1].signer).borrowETH(toWei(70), users[1].address)
        await borrowEthTx.wait()

        customPrint("User 1 borrows max available i.e. 70 ETH");
    })

    it("Sets borrowed ETH position liquidable", async function () {
        const { users, priceOracle, dai, link, weth, protocolDataProvider } = testEnv;

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);

        // Initially LINK price == 0.5 ETH
        // Simulated decrease in LINK price by 8% which should take the health factor below 1
        const Tx = await linkSource.setPrice(toWei(0.46));
        await Tx.wait();

        customPrint("Simulated decrease in LINK price by 8%")

        const userReserveData = await protocolDataProvider.getUserReserveData(weth.address, users[1].address)
        const userDaiReserveData = await protocolDataProvider.getUserReserveData(dai.address, users[1].address)
        const userLinkReserveData = await protocolDataProvider.getUserReserveData(link.address, users[1].address)

        expect(toEther(userReserveData.currentATokenBalance)).to.equal(0, "Invalid currentATokenBalance");
        expect(toEther(userReserveData.currentVariableDebt)).to.be.above(70, "Invalid currentVariableDebt");
        expect(toEther(userReserveData.healthFactor)).to.be.below(1, "Health factor not set");
    })

    it("Tests liquidation with ETH as debt", async function () {
        const { users, lendingPool, aLink, link, weth, aWeth, dWeth } = testEnv;

        // Required for liquidating borrowed ETH position
        const approveWethTx = await weth.connect(users[2].signer).approve(lendingPool.address, MAX_UINT);
        await approveWethTx.wait();

        customPrint("User 2 infinite approves the lendingPool for WETH token");

        const wrapEthTx = await weth.connect(users[2].signer).deposit({ value: toWei(100) })
        await wrapEthTx.wait()

        customPrint("User 2 wraps 100 ETH to 100 WETH via WETH contract");

        const dWethBalanceBefore = toEther(await dWeth.balanceOf(users[1].address))
        const aLinkBalanceBefore = toEther(await aLink.balanceOf(users[1].address))

        const wethReserveBefore = await lendingPool.getReserveData(weth.address)
        const linkReserveBefore = await lendingPool.getReserveData(link.address)

        const liquidatorLinkBalanceBefore = toEther(await link.balanceOf(users[2].address));
        const liquidatorWethBalanceBefore = toEther(await weth.balanceOf(users[2].address));
        const linkPoolLiquidityBefore = toEther(await link.balanceOf(aLink.address));
        const wethPoolLiquidityBefore = toEther(await weth.balanceOf(aWeth.address));

        const Tx = await lendingPool.connect(users[2].signer).liquidationCall(
            link.address,
            weth.address,
            users[1].address,
            MAX_UINT,
            false
        )
        await Tx.wait()

        customPrint("User 2 liquidates the unhealthy position");

        const dWethBalanceAfter = toEther(await dWeth.balanceOf(users[1].address))
        customPrint("User 1 has remaining debt of " + dWethBalanceAfter + "ETH after liquidation");

        const aLinkBalanceAfter = toEther(await aLink.balanceOf(users[1].address))
        customPrint("User 1 has remaining collateral of " + aLinkBalanceAfter + "LINK after liquidation");

        const wethReserveAfter = await lendingPool.getReserveData(weth.address)
        const linkReserveAfter = await lendingPool.getReserveData(link.address)

        const liquidatorLinkBalanceAfter = toEther(await link.balanceOf(users[2].address));
        const liquidatorWethBalanceAfter = toEther(await weth.balanceOf(users[2].address));
        const linkPoolLiquidityAfter = toEther(await link.balanceOf(aLink.address));
        const wethPoolLiquidityAfter = toEther(await weth.balanceOf(aWeth.address));

        // Check Debt tokens burned
        expect(dWethBalanceAfter).to.be.below(dWethBalanceBefore, "Debt tokens not burnt");

        // Check updated state, interest rates for both reserves
        expect(wethReserveBefore.lastUpdateTimestamp)
            .to.be.below(wethReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Debt Reserve")
        expect(wethReserveBefore.liquidityIndex)
            .to.be.below(wethReserveAfter.liquidityIndex, "Liquidity index not updated for Debt Reserve")
        expect(wethReserveBefore.variableBorrowIndex)
            .to.be.below(wethReserveAfter.variableBorrowIndex, "Variable Borrow index not updated for Debt Reserve")
        expect(wethReserveBefore.currentLiquidityRate)
            .to.be.above(wethReserveAfter.currentLiquidityRate, "Liquidity Rate not updated for Debt Reserve")
        expect(wethReserveBefore.currentVariableBorrowRate)
            .to.be.above(wethReserveAfter.currentVariableBorrowRate, "Variable Borrow Rate not updated for Debt Reserve")

        expect(linkReserveBefore.lastUpdateTimestamp)
            .to.be.below(linkReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Collateral Reserve")

        // Check AToken burn
        expect(aLinkBalanceAfter).to.be.below(aLinkBalanceBefore, "ATokens tokens not burnt");

        // Check asset transfer
        expect(liquidatorLinkBalanceAfter).to.be.above(liquidatorLinkBalanceBefore, "Invalid liquidator Collateral balance")
        expect(liquidatorWethBalanceAfter).to.be.below(liquidatorWethBalanceBefore, "Invalid liquidator Debt balance")
        expect(linkPoolLiquidityAfter).to.be.below(linkPoolLiquidityBefore, "Invalid Collateral reserve liquidity")
        expect(wethPoolLiquidityAfter).to.be.above(wethPoolLiquidityBefore, "Invalid Debt reserve liquidity")
    });

    it("Sets position with ETH collateral as liquidable", async function () {
        const { deployer, users, priceOracle, lendingPool, wethGateway, link, aLink, aWeth, dWeth, protocolDataProvider } = testEnv;

        // Repay any amount more than borrowed for a full repay
        const repayTx = await wethGateway.connect(users[1].signer).repayETH(toWei(100), { value: toWei(100) })
        await repayTx.wait()

        customPrint("User 1 repays entire ETH loan");

        const withdrawTx = await lendingPool.connect(users[1].signer).withdraw(
            link.address,
            toWei(10.326),
            users[1].address
        )
        await withdrawTx.wait()

        customPrint("User 1 withdraws 10 deposited LINK");

        const user0CollateralETHbalance = toEther(await aWeth.balanceOf(deployer.address));
        const user1CollateralLINKbalance = toEther(await aLink.balanceOf(users[1].address));

        customPrint("User 0 has " + user0CollateralETHbalance + " ETH deposited in the protocol");
        customPrint("User 1 has " + user1CollateralLINKbalance + " LINK deposited in the protocol");

        const totalETHDebt = toEther(await dWeth.totalSupply());

        expect(totalETHDebt).to.equal(0, "Some ETH debt still exists")

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);

        // Currently LINK price == 0.46 ETH
        // Simulated increase in LINK price = ETH price which should take the health factor below 1
        const linkPriceTx = await linkSource.setPrice(toWei(1));
        await linkPriceTx.wait();

        customPrint("Simulated increase in LINK price, so it equals ETH price")

        const borrowLinkTx = await lendingPool.borrow(
            link.address,
            toWei(70),
            deployer.address
        )
        await borrowLinkTx.wait()

        customPrint("User 0 borrows max available i.e. 70 LINK");

        // Simulated increase in LINK price by 8% which should take the health factor below 1
        const Tx = await linkSource.setPrice(toWei(1.08));
        await Tx.wait();

        customPrint("Simulated increase in LINK price by 8%")

        const userReserveData = await protocolDataProvider.getUserReserveData(link.address, deployer.address)

        expect(toEther(userReserveData.currentATokenBalance)).to.equal(0, "Invalid currentATokenBalance");
        expect(toEther(userReserveData.currentVariableDebt)).to.be.above(70, "Invalid currentVariableDebt");
        expect(toEther(userReserveData.healthFactor)).to.be.below(1, "Health factor not set");
    })

    it("Tests liquidation with ETH as collateral", async function () {
        const { deployer, users, lendingPool, wethGateway, dai, aWeth, link, weth, aLink, dLink } = testEnv;

        const dLinkBalanceBefore = toEther(await dLink.balanceOf(deployer.address))
        const aWethBalanceBefore = toEther(await aWeth.balanceOf(deployer.address))

        const linkReserveBefore = await lendingPool.getReserveData(link.address)
        const wethReserveBefore = await lendingPool.getReserveData(weth.address)

        const liquidatorLinkBalanceBefore = toEther(await link.balanceOf(users[2].address));
        const liquidatorWethBalanceBefore = toEther(await weth.balanceOf(users[2].address));
        const wethPoolLiquidityBefore = toEther(await weth.balanceOf(aWeth.address));
        const linkPoolLiquidityBefore = toEther(await link.balanceOf(aLink.address));

        const approveLinkTx = await link.connect(users[2].signer).approve(lendingPool.address, MAX_UINT);
        await approveLinkTx.wait();

        customPrint("User 2 infinite approves the lendingPool for LINK reserve");

        const Tx = await lendingPool.connect(users[2].signer).liquidationCall(
            weth.address,
            link.address,
            deployer.address,
            MAX_UINT,
            false
        )
        await Tx.wait()

        customPrint("User 2 liquidates the unhealthy position");

        const dLinkBalanceAfter = toEther(await dLink.balanceOf(deployer.address))
        customPrint("User 0 has remaining debt of " + dLinkBalanceAfter + " LINK after liquidation");

        const aWethBalanceAfter = toEther(await aWeth.balanceOf(deployer.address))
        customPrint("User 0 has remaining collateral of " + aWethBalanceAfter + " ETH after liquidation");

        const linkReserveAfter = await lendingPool.getReserveData(link.address)
        const wethReserveAfter = await lendingPool.getReserveData(weth.address)

        const liquidatorLinkBalanceAfter = toEther(await link.balanceOf(users[2].address));
        const liquidatorWethBalanceAfter = toEther(await weth.balanceOf(users[2].address));
        const wethPoolLiquidityAfter = toEther(await weth.balanceOf(aWeth.address));
        const linkPoolLiquidityAfter = toEther(await link.balanceOf(aLink.address));

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

        expect(wethReserveBefore.lastUpdateTimestamp)
            .to.be.below(wethReserveAfter.lastUpdateTimestamp, "Timestamp not updated for Collateral Reserve")

        // Check AToken burn
        expect(aWethBalanceAfter).to.be.below(aWethBalanceBefore, "ATokens tokens not burnt");

        // Check asset transfer
        expect(liquidatorLinkBalanceAfter).to.be.below(liquidatorLinkBalanceBefore, "Invalid liquidator Collateral balance")
        expect(liquidatorWethBalanceAfter).to.be.above(liquidatorWethBalanceBefore, "Invalid liquidator Debt balance")
        expect(linkPoolLiquidityAfter).to.be.above(linkPoolLiquidityBefore, "Invalid Collateral reserve liquidity")
        expect(wethPoolLiquidityAfter).to.be.below(wethPoolLiquidityBefore, "Invalid Debt reserve liquidity")
    });

    it("Resets the protocol after liquidation", async function () {
        const { deployer, users, priceOracle, lendingPool, wethGateway, weth, link } = testEnv;

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

        const withdrawETHTx = await wethGateway.withdrawETH(MAX_UINT)
        await withdrawETHTx.wait()

        customPrint("User 0 withdraws all deposited ETH");

        const sourceAddress = await priceOracle.getSourceOfAsset(link.address);
        const linkSource = await ethers.getContractAt("MockAggregatorV3", sourceAddress);
        const linkSourceTx = await linkSource.setPrice(toWei(0.5));
        await linkSourceTx.wait();

        customPrint("Simulated decrease in LINK price to its initial price")
    });
});
