async function main() {
  const gameContractFactory = await hre.ethers.getContractFactory("EpicGame");
  const gameContract = await gameContractFactory.deploy(
    ["Brad", "Leo", "Jessica"], // Names
    ["https://i.imgur.com/hES7D98.jpeg",
    "https://i.imgur.com/pKd5Sdk.png",
    "https://i.imgur.com/59lmfaj.jpeg"
    ],
    [100, 200, 300],
    [100, 70, 90],
    "Squid",
    "https://i.imgur.com/EdWSqadb.jpg",
    1000,
    50
  );

  await gameContract.deployed();
  console.log("Contract deployed to:", gameContract.address);

//   let txn;
//   txn = await gameContract.mintCharacterNFT(0);
//   await txn.wait();
//   console.log("Minted NFT #1");

//   txn = await gameContract.mintCharacterNFT(1);
//   await txn.wait();
//   console.log("Minted NFT #2");
  
//   txn = await gameContract.mintCharacterNFT(2);
//   await txn.wait();
//   console.log("Minted NFT #3");

//   txn = await gameContract.attackBoss();
//   await txn.wait();

//   txn = await gameContract.attackBoss();
//   await txn.wait();

//   console.log("Done deploying and minting!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
