// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
import { ethers } from "hardhat";
import { networkConfig } from '../helper-hardhat-config'

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // This compiles the contract, generate necessary files under the `artifacts` directory 
  const gameContractFactory = await ethers.getContractFactory("SquidGame");
  const [owner] = await ethers.getSigners();

  // console.log(owner.address)
  let chainId = 'default';
  let chainlinkFee = networkConfig[chainId].chainlinkFee;
  let interval = networkConfig[chainId].chainlinkFee;

  // This creates a local Ethereum network, just for this contract. 
  // After the script completes, it'll destroy that local network.
  const gameContract = await gameContractFactory.deploy(
    ["Kang Saebyeok", "Seong Gihoon", "Han Minyeo", "Oh Ilnam", "Jang Deoksu"], // Names
    ["QmQi4ovLuzAt8WnG4WVAqxXbstwfL5NbRj5VbJcNGcfAZ9",
    "QmRaDUWpKaA7oYH92GX3sLeK7wqgDqRtagdyFPQkFrpvNU",
    "QmSB3iReWfxTihw8g7SA9FLve5fkzu85nUk527kuAKeXo9",
    "QmWA8F2xVwvRMALUrfJbNQDcYsqjsEhG1B6sB5pCtxgP1Q",
    "QmZe6wSrFWRGJ1tnYzo9tQQek4BhSfsJ28zbpr3qJmKV2M",
    ],
    [1000, 1500, 800, 600, 2000], // hp
    [10, 20, 10, 30, 30], // damage
    "Front Man",
    "QmbK1pNvyVvMNAhy66MTMGwNPgyd8YHy8cyc4w8VPZEzR4",
    2000,
    100,
    chainlinkFee,
    interval
  );

  // Wait until the contract is mined and deployed to the local blockchain
  await gameContract.deployed();

  console.log("Contract deployed to:", gameContract.address);

  const tokenPrice = await gameContract.TOKEN_PRICE();
  let txn;
  txn = await gameContract.mintCharacterNFT(0, {
    value: tokenPrice
  });
  await txn.wait();  
  txn = await gameContract.mintCharacterNFT(2, {
    value: tokenPrice
  });
  await txn.wait();
//   txn = await gameContract.mintCharacterNFT(2);
//   await txn.wait();

//   txn = await gameContract.attackBoss();
//   await txn.wait();

//   txn = await gameContract.attackBoss();
//   await txn.wait();

//   tokenUri = await gameContract.tokenURI(2);
//   console.log("Token URIL:", tokenUri);
//   tokenUri = await gameContract.tokenURI(2);
//   console.log("Token URIL:", tokenUri);
//   tokenUri = await gameContract.tokenURI(3);
//   console.log("Token URIL:", tokenUri);
  
    txn = await gameContract.tokensOfOwner(owner.address)
    // await txn.wait();
    console.log(`Contracts owned by ${owner.address}`);
    txn.forEach((t: { toString: () => string; }) => {
        console.log(t.toString())
    })
    // console.log(txn[0].toString())
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
