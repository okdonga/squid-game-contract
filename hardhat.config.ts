// require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
import { task } from "hardhat/config"; // import function
import "@nomiclabs/hardhat-waffle"; // change require to import
import '@typechain/hardhat'
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_RINKEBY_KEY],
    },
    kovan: {
      url: process.env.ALCHEMY_KOVAN_RPC_URL,
      accounts: [process.env.PRIVATE_KOVAN_KEY],
      saveDeployments: true,
    }
  },
  mainnet: {
    chainId: 1,
    url: process.env.ALCHEMY_MAINNET_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  },
};
