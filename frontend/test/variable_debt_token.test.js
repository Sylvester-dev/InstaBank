const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ProtocolErrors } = require("./test_suite_setup/errors");
const { testEnv } = require('./test_suite_setup/setup');
// Run after atoken
require('./atoken.test')

describe("Variable Debt Token", function () {

    it('Tries to invoke mint not being the LendingPool', async () => {
        const { deployer, dDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(
            dDai.mint(deployer.address, deployer.address, '1', '1')
        ).to.be.revertedWith(CT_CALLER_MUST_BE_LENDING_POOL);
    });

    it('Tries to invoke burn not being the LendingPool', async () => {
        const { deployer, dDai } = testEnv;
        const { CT_CALLER_MUST_BE_LENDING_POOL } = ProtocolErrors;

        await expect(dDai.burn(deployer.address, '1', '1')).to.be.revertedWith(
            CT_CALLER_MUST_BE_LENDING_POOL
        );
    });
});
