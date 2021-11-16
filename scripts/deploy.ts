import hre from "hardhat";
import { networkConfig } from '../helper-hardhat-config'

async function main() {
  let chainId = 'default';
  let chainlinkFee = networkConfig[chainId].chainlinkFee;
  let interval = networkConfig[chainId].interval;
  const gameContractFactory = await hre.ethers.getContractFactory("SquidGame");
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

  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
