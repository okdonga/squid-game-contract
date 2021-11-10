import { ethers } from "hardhat"; // Import the Ethers library
import { expect } from "chai"
import { beforeEach } from "mocha";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SquidGame NFT", function () {
  let squidGameContract: Contract;
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;

  beforeEach(async () => {
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
      [1000, 1500, 800, 600, 2000], // hp
      [10, 20, 10, 30, 30], // damage
      "Front Man",
      "QmbK1pNvyVvMNAhy66MTMGwNPgyd8YHy8cyc4w8VPZEzR4",
      2000,
      100
    );
  });

  it("Should initialize Squid Game contract", async function () {
    expect(await squidGameContract.name()).to.equal("SquidGame");
    expect(await squidGameContract.symbol()).to.equal("SQU");
    expect(await squidGameContract.totalSupply()).to.equal(0); // Nothing is minted 
  });

  it("Should set the right owner", async () => {
    expect(await squidGameContract.owner()).to.equal(await owner.address);
  });

  it("Should mint a token for 0.001 ether", async function () {
    const tokenPrice = await squidGameContract.tokenPrice();
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
    const tokenPrice = await squidGameContract.tokenPrice();
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

  it('Should allow minting of multiple tokens by the same owner', async function() {

  })

  // 같은 _characterIndex index 는 두번 minting 할수 없다 
});