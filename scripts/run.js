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

  // We get the contract to deploy
  // This compiles the contract, generate necessary files under the `artifacts` directory 
  const gameContractFactory = await hre.ethers.getContractFactory("EpicGame");

  // This creates a local Ethereum network, just for this contract. 
  // After the script completes, it'll destroy that local network.
  const gameContract = await gameContractFactory.deploy();

  // Wait until the contract is mined and deployed to the local blockchain
  await gameContract.deployed();

  console.log("Contract deployed to:", gameContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
