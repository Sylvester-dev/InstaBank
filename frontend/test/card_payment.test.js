const { expect } = require("chai");
const { testEnv } = require('./test_suite_setup/setup');
const { toWei, toEther, customPrint } = require("./test_suite_setup/helpers");
const { MAX_UINT } = require("./test_suite_setup/constants");
// Run after atoken
require('./weth_liquidation.test')

describe("Card", function () {

    before("Sets environment for card testing", async () => {
        const { deployer, users, dai, link, dDai, dLink, dWeth, lendingPool, wethGateway, refiCollection } = testEnv;

        const daiTx = await lendingPool.deposit(
            dai.address,
            toWei(100),
            deployer.address
        )
        await daiTx.wait()

        customPrint("Deployer deposits 100 DAI");

        const linkTx = await lendingPool.connect(users[1].signer).deposit(
            link.address,
            toWei(100),
            users[1].address
        )
        await linkTx.wait()

        customPrint("User 1 deposits 100 LINK");

        const ethTx = await wethGateway.connect(users[1].signer).depositETH({ value: toWei(100) })
        await ethTx.wait()

        customPrint("User 1 deposits 100 ETH");

        const mintTx = await refiCollection.mint(
            "This card is your key to unlimited possiblities.",
            "imageCIDs.bronze",
            "imageCIDs.silver",
            "imageCIDs.gold",
            "imageCIDs.platinum"
        );
        await mintTx.wait();

        customPrint("Deployer mints its card");

        const approveDelegationDaiTx = await dDai.approveDelegation(refiCollection.address, toWei(20));
        await approveDelegationDaiTx.wait()

        customPrint("Deployer approves RefiCollection contract to borrow 20 DAI on behalf of itself");

        const approveDelegationLinkTx = await dLink.approveDelegation(refiCollection.address, toWei(20));
        await approveDelegationLinkTx.wait()

        customPrint("Deployer approves RefiCollection contract to borrow 20 LINK on behalf of itself");

        const approveDelegationGTx = await dWeth.approveDelegation(wethGateway.address, toWei(15));
        await approveDelegationGTx.wait()

        customPrint("Deployer approves WETHGateway contract to borrow 15 ETH on behalf of itself");

        const approveDelegationRTx = await dWeth.approveDelegation(refiCollection.address, toWei(15));
        await approveDelegationRTx.wait()

        customPrint("Deployer approves RefiCollection contract to borrow 15 ETH on behalf of itself");
    })

    it('Checks supported assets', async () => {
        const { refiCollection } = testEnv;

        const tokenList = await refiCollection.getSupportedAssets();

        for (let token in tokenList) {
            expect(token.symbol).to.not.equal("");
            expect(token.tokenAddress).to.not.equal("0x0000000000000000000000000000000000000000")
            expect(token.aTokenAddress).to.not.equal("0x0000000000000000000000000000000000000000")
            expect(token.dTokenAddress).to.not.equal("0x0000000000000000000000000000000000000000")
        }
    });

    it('Checks card limit', async () => {
        const { deployer, refiCollection } = testEnv;

        const borrowLimitETH = toEther(await refiCollection.getBorrowLimit(deployer.address));

        expect(borrowLimitETH).to.equal(35, "Invalid borrow limit")
    });

    it('Pays DAI and LINK using card', async () => {
        const { users, refiCollection, dai, link } = testEnv;

        const daiBalanceBefore = toEther(await dai.balanceOf(users[0].address))
        const linkBalanceBefore = toEther(await link.balanceOf(users[0].address))

        await refiCollection.payUsingCard(
            dai.address,
            toWei(20),
            users[0].address
        )

        customPrint("Deployer pays 20 DAI to User 0 using card");

        await refiCollection.payUsingCard(
            link.address,
            toWei(20),
            users[0].address
        )

        customPrint("Deployer pays 20 DAI to User 0 using card");

        const daiBalanceAfter = toEther(await dai.balanceOf(users[0].address))
        const linkBalanceAfter = toEther(await link.balanceOf(users[0].address))

        expect(daiBalanceAfter).to.equal(daiBalanceBefore + 20, "DAI not recieved");
        expect(linkBalanceAfter).to.equal(linkBalanceBefore + 20, "LINK not recieved");
    });

    it('Pays ETH using card', async () => {
        const { deployer, users, refiCollection, walletBalanceProvider } = testEnv;

        const beforeEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                users[0].address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )

        await refiCollection.payETHUsingCard(
            toWei(14.99),
            users[0].address
        )

        const afterEthBalance = toEther(
            await walletBalanceProvider.balanceOf(
                users[0].address,
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            )
        )

        expect(afterEthBalance).to.equal(beforeEthBalance + 14.99, "ETH not recieved");
    });
});
