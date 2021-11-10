//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Base64.sol";
import "hardhat/console.sol";

contract SquidGame is ERC721Enumerable, Ownable {
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    CharacterAttributes[] defaultCharacters;
    
    uint256 public constant tokenPrice = 1000000000000000; //0.001 ETH

    // tokenId => NFT attributes
    mapping(uint256 => CharacterAttributes) private nftHolderAttributes;

    // token ID => owner address (owner can have multiple NFTs)
    mapping(uint256 => address) private _owners;

    event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
    event AttackComplete(uint256 newBossHp, uint256 newPlayerHp);

    struct BigBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    BigBoss public bigBoss;

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint[] memory characterHp,
        uint[] memory characterAttackDmg,

        string memory bossName,
        string memory bossImageURI,
        uint bossHp,
        uint bossAttackDamage
    ) 
        ERC721("SquidGame", "SQU")
    {
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        for (uint256 i = 0; i < characterNames.length; i++) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            // CharacterAttributes memory c = defaultCharacters[i];
            // console.log("Done initializing %s w/ HP %s, igmg %s", c.name, c.hp, c.imageURI);
        }

        _tokenIds.increment();
    }

    function mintCharacterNFT(uint256 _characterIndex) external payable {
        require(_characterIndex < defaultCharacters.length, "Not a valid index");
        require(tokenPrice <= msg.value, "Ether value sent is not correct");

        // check if _characterIndex already minted
        uint256 totalNFTs = totalSupply();
        uint256 tokenId;
        bool isMintedAlready = false;
        for (tokenId = 1; tokenId <= totalNFTs; tokenId++) {
            if (nftHolderAttributes[tokenId].characterIndex == _characterIndex) {
                isMintedAlready = true;
                break;
            }
        }

        require(isMintedAlready == false, "The selected characterIndex is minted already");

        // Starts at 1 since it's being incremented in the constructor
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);

        _owners[newItemId] = msg.sender;

        _tokenIds.increment();

        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        charAttributes.name,
                        ' -- NFT #: ',
                        Strings.toString(_tokenId),
                        '", "description": "Squid Game Characters NFT", "image": "ipfs://',
                        charAttributes.imageURI,
                        '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
                        strAttackDamage,'} ]}'
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function attackBoss(uint256 tokenId) public {
        uint256 tokenIdOfPlayer = tokenId;
        CharacterAttributes storage player = nftHolderAttributes[tokenIdOfPlayer];
        // console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
        // console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);
        
        // First, check if you own the tokenId 
        require(_owners[tokenId] == msg.sender);
        // Make sure the player has more than 0 HP.
        require(player.hp > 0, "Player doesn't have enough HP");
        // Make sure the boss has more than 0 HP.
        require(bigBoss.hp > 0, "BigBoss doesn't have enough HP");
        // Allow player to attack boss.
        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }
        
        // Allow boss to attack player.
        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }

        // console.log("Boss attacked player. New player hp: %s\n", player.hp);
        // console.log("Player attacked boss. Boss hp: %s\n", bigBoss.hp);

        emit AttackComplete(bigBoss.hp, player.hp);
    }

    function getCharacterAttributes(uint256 _tokenId) public view returns (CharacterAttributes memory) {
        return nftHolderAttributes[_tokenId];
    }

    function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }

    /**
     * Returns a list of tokens owned by _owner
     */
    function tokensOfOwner(address _owner) external view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory tokensId = new uint256[](tokenCount);
            for (uint256 i; i < tokenCount; i++) {
                console.log(tokenOfOwnerByIndex(_owner, i));
                tokensId[i] = tokenOfOwnerByIndex(_owner, i);
            }
            return tokensId;
        }
    }
}
