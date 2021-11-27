import hre from "hardhat";
import { networkConfig } from '../helper-hardhat-config'

async function main() {
  let chainId = 'default';
  let chainlinkFee = networkConfig[chainId].chainlinkFee;
  let interval = networkConfig[chainId].interval;
  const gameContractFactory = await hre.ethers.getContractFactory("SquidGame");
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

  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
