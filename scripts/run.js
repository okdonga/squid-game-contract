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
  const gameContract = await gameContractFactory.deploy(
    ["Brad", "Leo", "Jessica"], // Names
    ["https://i.imgur.com/hES7D98.jpeg",
    "https://i.imgur.com/pKd5Sdk.png",
    "https://i.imgur.com/59lmfaj.jpeg"
    ],
    [100, 200, 300],
    [100, 70, 90]
  );

  // Wait until the contract is mined and deployed to the local blockchain
  await gameContract.deployed();

  console.log("Contract deployed to:", gameContract.address);

  let txn;
  txn = await gameContract.mintCharacterNFT(0);
  await txn.wait();
  txn = await gameContract.mintCharacterNFT(1);
  await txn.wait();
  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();

  tokenUri = await gameContract.tokenURI(1);
  console.log("Token URIL:", tokenUri);
  tokenUri = await gameContract.tokenURI(2);
  console.log("Token URIL:", tokenUri);
  tokenUri = await gameContract.tokenURI(3);
  console.log("Token URIL:", tokenUri);
  
//   txn = await gameContract.mintCharacterNFT(3);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
