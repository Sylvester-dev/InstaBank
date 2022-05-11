const { expect } = require("chai");
const { testEnv } = require('./test_suite_setup/setup');
const { toWei, toEther } = require('./test_suite_setup/helpers');
// Run after addresses_provider
require('./addresses_provider.test')

describe("Mock ERC20", function () {

    it("Checks 'mint' functionality", async function () {
        const { deployer, walletBalanceProvider, dai } = testEnv

        const beforeBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )

        const Tx = await dai.mint(deployer.address, toWei(10));
        await Tx.wait();

        const afterBalance = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )

        expect(afterBalance).to.equal(beforeBalance + 10, "Incorrect ERC20 balance");
    });

    it("Checks 'transfer' functionality", async function () {
        const { deployer, users, walletBalanceProvider, dai } = testEnv;

        const beforeBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )
        const beforeBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                dai.address
            )
        )

        const Tx = await dai.transfer(users[1].address, toWei(1));
        await Tx.wait();

        const afterBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )
        const afterBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                dai.address
            )
        )

        expect(afterBalanceA).to.equal(beforeBalanceA - 1, "Incorrect 'from' balance");
        expect(afterBalanceB).to.equal(beforeBalanceB + 1, "Incorrect 'to' balance");
    });

    it("Checks 'approve' and 'transferFrom' functionality", async function () {
        const { deployer, users, walletBalanceProvider, dai } = testEnv;

        const beforeBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )
        const beforeBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                dai.address
            )
        )

        const approveTx = await dai.approve(users[1].address, toWei(1));
        await approveTx.wait();

        const transferTx = await dai.connect(users[1].signer).transferFrom(
            deployer.address, users[1].address, toWei(1)
        );
        await transferTx.wait();

        const afterBalanceA = toEther(
            await walletBalanceProvider.balanceOf(
                deployer.address,
                dai.address
            )
        )
        const afterBalanceB = toEther(
            await walletBalanceProvider.balanceOf(
                users[1].address,
                dai.address
            )
        )

        expect(afterBalanceA).to.equal(beforeBalanceA - 1, "Incorrect 'from' balance");
        expect(afterBalanceB).to.equal(beforeBalanceB + 1, "Incorrect 'to' balance");
    });
});
