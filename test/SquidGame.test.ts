import { ethers } from "hardhat";
import hre from "hardhat";
import { expect } from "chai"
import { beforeEach } from "mocha";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { networkConfig } from '../helper-hardhat-config'
// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { useEnvironment } from "./helpers";

describe("SquidGame NFT", function () {
  let squidGameContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let tokenPrice: number;
  let chainlinkFee: string; 
  let interval: string;

  beforeEach(async () => {
    
    // const chainId = await hre.ethers.getChainId();
    const chainId = 31337;
    chainlinkFee = networkConfig[chainId].chainlinkFee;
    interval = networkConfig[chainId].chainlinkFee;

    const squidGameFactory = await ethers.getContractFactory(
      "SquidGame"
    );
    [owner, address1] = await ethers.getSigners();
    squidGameContract = await squidGameFactory.deploy(
      ["Kang Saebyeok", "Seong Gihoon", "Han Minyeo", "Oh Ilnam", "Jang Deoksu"],
      ["QmQi4ovLuzAt8WnG4WVAqxXbstwfL5NbRj5VbJcNGcfAZ9",
      "QmRaDUWpKaA7oYH92GX3sLeK7wqgDqRtagdyFPQkFrpvNU",
      "QmSB3iReWfxTihw8g7SA9FLve5fkzu85nUk527kuAKeXo9",
      "QmWA8F2xVwvRMALUrfJbNQDcYsqjsEhG1B6sB5pCtxgP1Q",
      "QmZe6wSrFWRGJ1tnYzo9tQQek4BhSfsJ28zbpr3qJmKV2M",
      ],
      [100, 150, 80, 60, 500], // hp
      [10, 20, 10, 30, 200], // damage
      "Front Man",
      "QmbK1pNvyVvMNAhy66MTMGwNPgyd8YHy8cyc4w8VPZEzR4",
      200,
      100,
      chainlinkFee,
      interval
    );

    tokenPrice = await squidGameContract.TOKEN_PRICE();
  });

  describe("constructor", function () {
    it("Should initialize Squid Game contract", async function () {
      expect(await squidGameContract.name()).to.equal("SquidGame");
      expect(await squidGameContract.symbol()).to.equal("SQU");
      expect(await squidGameContract.totalSupply()).to.equal(0); // Nothing is minted 
    });
  
    it("Should set the right owner", async () => {
      expect(await squidGameContract.owner()).to.equal(await owner.address);
    });
  })
  
  describe("mintCharacterNFT", function () {
    it("Should mint a token for 0.001 ether", async function () {
      const tokenId = await squidGameContract.totalSupply();
      const characterIndex = 0;
      expect(
        await squidGameContract.mintCharacterNFT(characterIndex, {
          value: tokenPrice,
        })
      )
      .to.emit(squidGameContract, "CharacterNFTMinted")
      .withArgs(owner.address, tokenId+1, characterIndex);
    });
  
    it('Should return total number of tokens owned by an address', async function() {
      await squidGameContract.mintCharacterNFT(0, {
        value: tokenPrice,
      })
  
      await squidGameContract.mintCharacterNFT(1, {
        value: tokenPrice,
      })
  
      const tokensId = await squidGameContract.tokensOfOwner(owner.address);
      expect(tokensId[0]).to.equal(1);
      expect(tokensId[1]).to.equal(2);   
    })
  
    it('Should error and revert if the _characterIndex is greater than the count of default characters', async function() {
      await expect(squidGameContract.mintCharacterNFT(100, {
        value: tokenPrice,
      })).to.revertedWith('Not a valid index');
    })

    it('Should error and revert if the ether provided is not enough', async function() {
      await expect(squidGameContract.mintCharacterNFT(0, {
        value: 1, // 1wei
      })).to.revertedWith('Ether value sent is not correct');
    })

    it('Should error and revert if the _characterIndex is already minted', async function() {
      await squidGameContract.mintCharacterNFT(3, {
        value: tokenPrice,
      })

      await squidGameContract.mintCharacterNFT(2, {
        value: tokenPrice,
      })
  
      await expect(squidGameContract.mintCharacterNFT(3, {
        value: tokenPrice,
      })).to.revertedWith('The selected characterIndex is minted already')
    })
  })

  describe("tokenURI", function () {
    it('Should return tokenURI', async function() {
      await squidGameContract.mintCharacterNFT(3, {
        value: tokenPrice,
      })

      expect(await squidGameContract.tokenURI(1)).to.equal("data:application/json;base64,eyJuYW1lIjogIk9oIElsbmFtIC0tIE5GVCAjOiAxIiwgImRlc2NyaXB0aW9uIjogIlNxdWlkIEdhbWUgQ2hhcmFjdGVycyBORlQiLCAiaW1hZ2UiOiAiaXBmczovL1FtV0E4RjJ4Vnd2Uk1BTFVyZkpiTlFEY1lzcWpzRWhHMUI2c0I1cEN0eGdQMVEiLCAiYXR0cmlidXRlcyI6IFsgeyAidHJhaXRfdHlwZSI6ICJIZWFsdGggUG9pbnRzIiwgInZhbHVlIjogNjAsICJtYXhfdmFsdWUiOjYwfSwgeyAidHJhaXRfdHlwZSI6ICJBdHRhY2sgRGFtYWdlIiwgInZhbHVlIjogMzB9IF19");
    })
  })

  describe("attackBoss", function() {
    it('Should deduct health points from the boss and the character respectively', async function() {
      await squidGameContract.mintCharacterNFT(1, {
        value: tokenPrice,
      })
      let boss = await squidGameContract.playerToBoss(owner.address)
      let bossHp = boss[2];
      let bossAttackDamage = boss[4];
      let character = await squidGameContract.nftHolderAttributes(1);
      let characterHp = character[3];
      let characterAttackDamage = character[5];

      expect(
        await squidGameContract.attackBoss(1)
      )
      .to.emit(squidGameContract, "AttackComplete")
      .withArgs(200 - 20, 150 - 100);
    })

    it('Should attack, then if hp is less than the attack damage, hp should be set to 0', async function() {
      await squidGameContract.mintCharacterNFT(1, {
        value: tokenPrice,
      })
      let boss = await squidGameContract.playerToBoss(owner.address)
      let bossHp = boss[2];
      let bossAttackDamage = boss[4];
      let character = await squidGameContract.nftHolderAttributes(1);
      let characterHp = character[3];
      let characterAttackDamage = character[5];

      // attack twice 
      await squidGameContract.attackBoss(1);
      expect(
        await squidGameContract.attackBoss(1)
      )
      .to.emit(squidGameContract, "AttackComplete")
      .withArgs(160, 0);
    })

    it('If a player has 0 hp, and an attack is attempted, the transaction is reverted', async function() {
      await squidGameContract.mintCharacterNFT(1, {
        value: tokenPrice,
      })
      let boss = await squidGameContract.playerToBoss(owner.address)
      let bossHp = boss[2];
      let bossAttackDamage = boss[4];
      let character = await squidGameContract.nftHolderAttributes(1);
      let characterHp = character[3];
      let characterAttackDamage = character[5];

      // attack three times  
      await squidGameContract.attackBoss(1);
      await squidGameContract.attackBoss(1);

      await expect(squidGameContract.attackBoss(1)).to.revertedWith("Player doesn't have enough HP")
    })

    it('If a boss has 0 hp, and an attack is attempted, the transaction is reverted', async function() {
      await squidGameContract.mintCharacterNFT(4, {
        value: tokenPrice,
      })
      let boss = await squidGameContract.playerToBoss(owner.address)
      let bossHp = boss[2];
      let bossAttackDamage = boss[4];
      let character = await squidGameContract.nftHolderAttributes(1);
      let characterHp = character[3];
      let characterAttackDamage = character[5];

      await squidGameContract.attackBoss(1);
      await expect(squidGameContract.attackBoss(1)).to.revertedWith("BigBoss doesn't have enough HP")
    })
  })
});