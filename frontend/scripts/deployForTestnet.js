// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Deploy WadRayMath Library for linking purpose
  const WadRayMath = await hre.ethers.getContractFactory("WadRayMath");
  const wadRayMath = await WadRayMath.deploy();
  await wadRayMath.deployed();

  // Deploy ReserveLogic Library for linking purpose
  const ReserveLogic = await hre.ethers.getContractFactory("ReserveLogic");
  const reserveLogic = await ReserveLogic.deploy();
  await reserveLogic.deployed();

  // Deploy GenericLogic Library for linking purpose
  const GenericLogic = await hre.ethers.getContractFactory("GenericLogic");
  const genericLogic = await GenericLogic.deploy();
  await genericLogic.deployed();

  // Deploy ValidationLogic Library for linking purpose
  const ValidationLogic = await hre.ethers.getContractFactory(
    "ValidationLogic",
    {
      libraries: {
        GenericLogic: genericLogic.address,
      },
    }
  );
  const validationLogic = await ValidationLogic.deploy();
  await validationLogic.deployed();

  // Deploy ReputationLogic Library for linking purpose
  const ReputationLogic = await hre.ethers.getContractFactory("ReputationLogic");
  const reputationLogic = await ReputationLogic.deploy();
  await reputationLogic.deployed();

  // Deploy AddressesProvider contract
  const AddressesProvider = await hre.ethers.getContractFactory("AddressesProvider", {
    libraries: {
      ReserveLogic: reserveLogic.address,
      ValidationLogic: validationLogic.address,
      WadRayMath: wadRayMath.address,
      ReputationLogic: reputationLogic.address,
    }
  });

  const addressesProvider = await AddressesProvider.deploy();
  await addressesProvider.deployed();

  console.log("AddressesProvider deployed to:", addressesProvider.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
