const { expect } = require("chai");
const { ProtocolErrors } = require("./test_suite_setup/errors");
const { testEnv } = require('./test_suite_setup/setup');
// Run after mock_weth
require('./mock_weth.test')

describe("AToken", function () {

    it('Tries to invoke mint not being the LendingPool', async () => {
        const { deployer, aDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(aDai.mint(deployer.address, '1', '1')).to.be.revertedWith(
            CT_CALLER_MUST_BE_LENDING_POOL
        );
    });

    it('Tries to invoke burn not being the LendingPool', async () => {
        const { deployer, aDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(aDai.burn(deployer.address, deployer.address, '1', '1')).to.be.revertedWith(
            CT_CALLER_MUST_BE_LENDING_POOL
        );
    });

    it('Tries to invoke transferOnLiquidation not being the LendingPool', async () => {
        const { deployer, users, aDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(
            aDai.transferOnLiquidation(deployer.address, users[0].address, '1')
        ).to.be.revertedWith(
            CT_CALLER_MUST_BE_LENDING_POOL
        );
    });

    it('Tries to invoke transferUnderlyingTo not being the LendingPool', async () => {
        const { deployer, aDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(aDai.transferUnderlyingTo(deployer.address, '1')).to.be.revertedWith(
            CT_CALLER_MUST_BE_LENDING_POOL
        );
    });
});
