const { expect } = require("chai");
const { testEnv } = require('./test_suite_setup/setup');
const { toWei, toEther, customPrint } = require("./test_suite_setup/helpers");
const { MAX_UINT } = require("./test_suite_setup/constants");
// Run after lendingpool/withdraw
require('./lendingpool/liquidation.test')

describe("WETH Gateway", function () {

    before("User 1 deposits 100 DAI and 100 LINK", async function () {
        const { users, lendingPool, wethGateway, dai, link, aWeth } = testEnv;

        // One time infinite approve DAI User 0
        const approveDai0Tx = await dai.approve(lendingPool.address, MAX_UINT);
        await approveDai0Tx.wait();

        // One time infinite approve DAI
        const approveDaiTx = await dai.connect(users[1].signer).approve(lendingPool.address, MAX_UINT);
        await approveDaiTx.wait();

        customPrint("User 1 infinite approves the lendingPool for DAI reserve");

        const daiTx = await lendingPool.connect(users[1].signer).deposit(
            dai.address,
            toWei(100),
            users[1].address
        )
        await daiTx.wait()

        customPrint("User 1 deposits 100 DAI");

        // One time infinite approve LINK
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

    it("Deposits ETH", async function () {
        const { deployer, lendingPool, wethGateway, protocolDataProvider, weth, aWeth } = testEnv;

        const reserveBefore = await lendingPool.getReserveData(weth.address)

        // One time infinite approve aWeth
        // Required at withdrawal time. i.e. do this before ETH deposit
        const approveAWethTx = await aWeth.approve(wethGateway.address, MAX_UINT);
        await approveAWethTx.wait();

        customPrint("User 0 infinite approves the wEthGateway for aWeth tokens");

        const Tx = await wethGateway.depositETH({ value: toWei(10) })
        await Tx.wait()

        customPrint("User 0 deposits 10 ETH");

        const reserveAfter = await lendingPool.getReserveData(weth.address)
        const userData = await lendingPool.getUserAccountData(deployer.address)
        const userConfig = await protocolDataProvider.getUserReserveData(weth.address, deployer.address);
        const aWethBalance = toEther(await aWeth.balanceOf(deployer.address))

        expect(reserveBefore.lastUpdateTimestamp)
            .to.not.equal(reserveAfter.lastUpdateTimestamp, "Timestamp not updated")

        expect(userConfig.usageAsCollateralEnabled).to.equal(true, "Collateral not set true");
        expect(toEther(userData.totalCollateralETH)).to.equal(10, "Invalid collateral amount")
        expect(aWethBalance).to.equal(10, "ATokens not minted to user")
    });

    it("Borrows ETH and against ETH", async function () {
        const { deployer, users, lendingPool, wethGateway,
            protocolDataProvider, walletBalanceProvider, weth, dai, dWeth, dDai } = testEnv;

        customPrint("User 1 borrows 10 ETH against deposited LINK as collateral");

        const ethBalanceBefore = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )

        const approveDelegationTx = await dWeth.connect(users[1].signer).approveDelegation(wethGateway.address, toWei(10));
        await approveDelegationTx.wait()

        customPrint("User 1 approves WethGateway contract to borrow 10 ETH on behalf of itself");

        const borrowEthTx = await wethGateway.connect(users[1].signer).borrowETH(toWei(10), users[1].address)
        await borrowEthTx.wait()

        const user1Config = await protocolDataProvider.getUserReserveData(weth.address, users[1].address);
        const dWethBalance = toEther(await dWeth.balanceOf(users[1].address))
        const ethBalanceAfter = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )

        expect(user1Config.isBorrowed).to.equal(true, "Borrowing not set true");
        expect(dWethBalance).to.equal(10, "Incorrect Debt Tokens minted")
        expect(ethBalanceBefore).to.be.lessThanOrEqual(ethBalanceAfter + 10, "Incorrect funds borrowed")

        customPrint("User 0 borrows 10 DAI against depsited ETH as collateral");

        const daiBalanceBefore = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )

        const borrowDaiTx = await lendingPool.borrow(
            dai.address,
            toWei(10),
            deployer.address
        )
        await borrowDaiTx.wait()

        const user0Config = await protocolDataProvider.getUserReserveData(dai.address, deployer.address);
        const dDaiBalance = toEther(await dDai.balanceOf(deployer.address))
        const daiBalanceAfter = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )

        expect(user0Config.isBorrowed).to.equal(true, "Borrowing not set true");
        expect(dDaiBalance).to.equal(10, "Incorrect Debt Tokens minted")
        expect(daiBalanceAfter).to.equal(daiBalanceBefore + 10, "Incorrect funds borrowed")
    });

    it("Repays ETH loan", async function () {
        const { deployer, users, wethGateway, protocolDataProvider, weth, aWeth, dWeth } = testEnv;

        const wethBalanceBefore = toEther(await weth.balanceOf(aWeth.address))

        // Repay any amount more than borrowed for a full repay
        const Tx = await wethGateway.connect(users[1].signer).repayETH(toWei(100), { value: toWei(100) })
        await Tx.wait()

        customPrint("User 1 repays entire ETH loan");

        const userConfig = await protocolDataProvider.getUserReserveData(weth.address, deployer.address);
        const dWethBalance = toEther(await dWeth.balanceOf(deployer.address))
        const wethBalanceAfter = toEther(await weth.balanceOf(aWeth.address))

        expect(userConfig.isBorrowed).to.equal(false, "Borrowing not set false");
        expect(dWethBalance).to.equal(0, "Incorrect Debt Tokens burned")
        // Interest has to be paid
        expect(wethBalanceAfter).to.be.above(wethBalanceBefore + 10, "Incorrect funds repaid")
    });

    it("Withdraws all ETH", async function () {
        const { deployer, lendingPool, wethGateway, protocolDataProvider,
            walletBalanceProvider, dai, aWeth, weth } = testEnv;

        // Repay any amount more than borrowed for a full repay
        const repayTx = await lendingPool.repay(
            dai.address,
            toWei(100),
            deployer.address
        )
        await repayTx.wait()

        customPrint("User 0 repays entire DAI loan");

        const beforeEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )

        const Tx = await wethGateway.withdrawETH(MAX_UINT)
        await Tx.wait()

        customPrint("User 0 withdraws all deposited ETH");

        const afterEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )
        const userConfig = await protocolDataProvider.getUserReserveData(weth.address, deployer.address);
        const aWethBalance = toEther(await aWeth.balanceOf(deployer.address))

        expect(userConfig.usageAsCollateralEnabled).to.equal(false, "Collateral not set false");
        expect(aWethBalance).to.equal(0, "ATokens not burned")
        // Interest is earned, but still gas cost is more than that
        expect(afterEthBalance).to.be.above(beforeEthBalance + 9.9, "Incorrect ETH balance"
        )
    });

    it("Resets protocol for furthur tests", async function () {
        const { deployer, users, lendingPool, protocolDataProvider, dai, link } = testEnv;

        const Tx = await lendingPool.connect(users[1].signer).withdraw(
            link.address,
            MAX_UINT,
            users[1].address
        )
        await Tx.wait()

        customPrint("User 1 withdraws all deposited LINK");

        const daiTx = await lendingPool.connect(users[1].signer).withdraw(
            dai.address,
            MAX_UINT,
            users[1].address
        )
        await Tx.wait()

        customPrint("User 1 withdraws all deposited DAI");
    })

});
