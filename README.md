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

```shell
# Deploy to testnet 
# Make sure you have some MATIC tokens in your wallet 
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
