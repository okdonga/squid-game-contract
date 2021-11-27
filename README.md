# NFT Squid Game Contract

This is a full stack NFT minting app running on Ethereum with Polygon & React.js

For the frontend code, see [here](https://github.com/okdonga/squid-game-frontend)

### Local setup: 

```shell
npx hardhat run scripts/run.js 
# or 
npx hardhat run scripts/run.js --network localhost
```

### To deploy:
I deployed to Polygon network because it's faster, and cheaper. 
To deploy to Polygon test or main networks, update the configuration located in `hardhat.config.ts`.
Create a env file called `.env` and copy the keys from `.env.sample` 
```shell
RINKEBY_PRIVATE_KEY=''
KOVAN_PRIVATE_KEY=''
MUMBAI_PRIVATE_KEY=''
POLYGON_PRIVATE_KEY=''
MAINNET_PRIVATE_KEY=''

ALCHEMY_RINKEBY_RPC_URL=''
ALCHEMY_KOVAN_RPC_URL=''
ALCHEMY_MUMBAI_RPC_URL=''
ALCHEMY_POLYGON_RPC_URL=''
ALCHEMY_MAINNET_RPC_URL=''
```

Then, to deploy, run the command below. 
Make sure you have some MATIC tokens in your wallet 

```shell
npx hardhat run scripts/deploy.js --network mumbai
```

### To test: 
```shell
npx hardhat test
```

### Services used
- Metamask 
- Alchemy
- IPFS 
- Pinata 

### Tech stack
- Solidity
- Hardhat
- TypeScript
- Chai
- Mocha


### Front-end 
- React (See [here](https://github.com/okdonga/squid-game-frontend))
