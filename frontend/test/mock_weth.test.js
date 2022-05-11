const { expect } = require("chai");
const { ProtocolErrors } = require("./test_suite_setup/errors");
const { toEther, toWei } = require("./test_suite_setup/helpers");
const { testEnv } = require('./test_suite_setup/setup');
// Run after mock_erc20
require('./mock_erc20.test')

describe("Mock WETH", function () {

    it("Deposits ETH to mint equal WETH", async function () {
        const { deployer, walletBalanceProvider, weth } = testEnv

        const beforeEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )
        const beforeWethBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )

        const Tx = await weth.deposit({ value: toWei(5) });
        await Tx.wait();

        const afterEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )
        const afterWethBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )

        // Considering gas used, ETH balance will be slightly less
        expect(afterEthBalance).to.be.lessThanOrEqual(beforeEthBalance - 5, "Incorrect ETH balance");
        expect(afterWethBalance).to.equal(beforeWethBalance + 5, "Incorrect WETH balance");
    });

    it("Withdraws ETH by burning equal WETH", async function () {
        const { deployer, walletBalanceProvider, weth } = testEnv

        const beforeEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )
        const beforeWethBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )

        const Tx = await weth.withdraw(toWei(1));
        await Tx.wait();

        const afterEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )
        const afterWethBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )

        // Considering gas used, ETH balance will be slightly less
        expect(afterEthBalance).to.be.within(
            beforeEthBalance, beforeEthBalance + 1, "Incorrect ETH balance"
        )
        expect(afterWethBalance).to.equal(beforeWethBalance - 1, "Incorrect WETH balance");
    });

    it("Tries to Withdraw ETH without holding WETH", async function () {
        const { users, weth } = testEnv
        const { ET_AMOUNT_EXCEEDS_BALANCE } = ProtocolErrors;

        await expect(weth.connect(users[1].signer).withdraw(toWei(1)))
            .to.be.revertedWith(
                ET_AMOUNT_EXCEEDS_BALANCE
            );
    });

    it("Checks 'transfer' functionality", async function () {
        const { deployer, users, walletBalanceProvider, weth } = testEnv;

        const beforeBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )
        const beforeBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                weth.address
            )
        )

        const Tx = await weth.transfer(users[1].address, toWei(1));
        await Tx.wait();

        const afterBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )
        const afterBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                weth.address
            )
        )

        expect(afterBalanceA).to.equal(beforeBalanceA - 1, "Incorrect 'from' balance");
        expect(afterBalanceB).to.equal(beforeBalanceB + 1, "Incorrect 'to' balance");
    });

    it("Checks 'approve' and 'transferFrom' functionality", async function () {
        const { deployer, users, walletBalanceProvider, weth } = testEnv;

        const beforeBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )
        const beforeBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                weth.address
            )
        )

        const approveTx = await weth.approve(users[1].address, toWei(1));
        await approveTx.wait();

        const transferTx = await weth.connect(users[1].signer).transferFrom(
            deployer.address, users[1].address, toWei(1)
        );
        await transferTx.wait();

        const afterBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                weth.address
            )
        )
        const afterBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                weth.address
            )
        )

        expect(afterBalanceA).to.equal(beforeBalanceA - 1, "Incorrect 'from' balance");
        expect(afterBalanceB).to.equal(beforeBalanceB + 1, "Incorrect 'to' balance");
    });
});
