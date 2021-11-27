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
  const CID = "QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW";

  // console.log(owner.address)
  let chainId = 'default';
  let chainlinkFee = networkConfig[chainId].chainlinkFee;
  let interval = networkConfig[chainId].chainlinkFee;

  // This creates a local Ethereum network, just for this contract. 
  // After the script completes, it'll destroy that local network.
  const gameContract = await gameContractFactory.deploy(
    [ "Seong Gihoon", "Kang Saebyeok", "Oh Ilnam", "Ali", "Trio"], // Names
    ["QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW/1.png",
    "QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW/2.png",
    "QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW/3.png",
    "QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW/4.png",
    "QmWqjVyy8ycXuEQ1pAHee35eNd9VvAinJnJXzyi6nPVhMW/5.png",
    ],
    [100, 80, 80, 60, 200], // hp
    [10, 20, 10, 20, 30], // damage
    "Front Man",
    "QmWhARsTbcRHWK4fhgeS5pRpWGchGT5ivwex4qyrXXR9iV",
    200,
    30,
    chainlinkFee,
    interval
  );

  // Wait until the contract is mined and deployed to the local blockchain
  await gameContract.deployed();

  console.log("Contract deployed to:", gameContract.address);

  // const tokenPrice = await gameContract.TOKEN_PRICE();
  let txn;
  txn = await gameContract.mintCharacterNFT(0, {
    // value: tokenPrice
  });
  await txn.wait();  
  txn = await gameContract.mintCharacterNFT(2, {
    // value: tokenPrice
  });
  await txn.wait();
//   txn = await gameContract.mintCharacterNFT(2);
//   await txn.wait();

//   txn = await gameContract.attackBoss();
//   await txn.wait();

//   txn = await gameContract.attackBoss();
//   await txn.wait();

    let tokenUri = await gameContract.tokenURI(2);
    console.log("Token URIL:", tokenUri);
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
    console.log(await gameContract.nftHolderAttributes)
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
