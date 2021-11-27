//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./libraries/Base64.sol";
import "hardhat/console.sol";

contract SquidGame is ERC721Enumerable, Ownable, KeeperCompatibleInterface {
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }
    
    struct BigBoss {
        // uint256 bossIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    CharacterAttributes[] defaultCharacters;
    BigBoss public bigBoss;    
    
    // uint256 public constant TOKEN_PRICE = 1000000000000000; //0.001 ETH
    
    uint256 public lastTimeStamp;
    uint256 public chainlinkFee;
    uint256 public interval;


    // token ID => owner address (owner can have multiple NFTs)
    mapping(uint256 => address) private _owners;

    // tokenId => NFT attributes
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    // the list of tokenIds that need reset 
    uint256[] lostCharacters; 
    // mapping(uint256 => GameStatus) public gameRecords;

    // owner address => bossId  
    mapping(address => BigBoss) public playerToBoss;

    event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
    event AttackComplete(uint256 newBossHp, uint256 newPlayerHp);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint[] memory characterHp,
        uint[] memory characterAttackDmg,

        string memory bossName,
        string memory bossImageURI,
        uint bossHp,
        uint bossAttackDamage,

        uint256 _chainlinkFee,
        uint256 updateInterval
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

        lastTimeStamp = block.timestamp;
        chainlinkFee = _chainlinkFee;
        interval = updateInterval;
    }

    function mintCharacterNFT(uint256 _characterIndex) external payable {
        require(_characterIndex < defaultCharacters.length, "Not a valid index");
        // require(TOKEN_PRICE <= msg.value, "Ether value sent is not correct");

        // check if _characterIndex is already minted
        uint256 totalNFTs = totalSupply();
        bool isMintedAlready = false;
        uint256 tokenId;
        for (tokenId = 1; tokenId <= totalNFTs; tokenId++) {
            if (nftHolderAttributes[tokenId].characterIndex == _characterIndex) {
                isMintedAlready = true;
                break;
            }
        }

        require(isMintedAlready == false, "The selected characterIndex is minted already");

        // only if it's user's first token, initialize the bigBoss 
        uint256 tokenCount = balanceOf(msg.sender);
        if (tokenCount == 0) {
            playerToBoss[msg.sender] = bigBoss;
        }

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
        BigBoss storage boss = playerToBoss[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[tokenIdOfPlayer];
        // console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
        console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);
        
        // First, check if you own the tokenId 
        require(_owners[tokenId] == msg.sender);
        // Make sure the player has more than 0 HP.
        require(player.hp > 0, "Player doesn't have enough HP");
        // Make sure the boss has more than 0 HP.
        require(boss.hp > 0, "BigBoss doesn't have enough HP");
        // Allow player to attack boss.
        if (boss.hp < player.attackDamage) {
            boss.hp = 0;
        } else {
            boss.hp = boss.hp - player.attackDamage;
        }
        
        // Allow boss to attack player.
        if (player.hp < boss.attackDamage) {
            player.hp = 0;
            
        } else {
            player.hp = player.hp - boss.attackDamage;
        }

        if (boss.hp == 0 || player.hp == 0) {
            // Game over, recharge hp of all your characters 
            // Fetch all your characters owned by you 
            // gameRecords[tokenIdOfPlayer].over = true;
            lostCharacters.push(tokenId);
            // gameStatus[tokenIdOfPlayer].lastTimeStamp = block.timestamp;
        }

        emit AttackComplete(boss.hp, player.hp);
    }

    /// @notice Returns all the relevant information about a specific character
    /// @param _tokenId The ID of the character of interest 
    function getCharacterAttributes(uint256 _tokenId) public view returns (CharacterAttributes memory) {
        return nftHolderAttributes[_tokenId];
    }

    function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
        return defaultCharacters;
    }

    /// @notice Returns all the relevant information about the boss 
    // function getBigBoss() public view returns (BigBoss memory) {
    //     return bigBoss;
    // }

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

    // @dev This is called by Chainlink Keepers to check if work needs to be done
    // They look for `upkeepNeeded` to return True
    // The following should be true for this to return true:
    // 1. The time interval has passed the interval time defined in the constructor
    // 2. The contract has LINK 
    // 3. The contract has ETH
    // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    function checkUpkeep(bytes memory /* checkData */) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        // bool hasLink = LINK.balanceOf(address(this)) >= chainlinkFee;
        upkeepNeeded = (((block.timestamp - lastTimeStamp) > interval) &&
            // hasLink &&
            (address(this).balance >= 0));
        
    }

    // @dev This is called by Chainlink Keepers to handle work
    // This kicks off a Chainlink VRF call to reset hp of players 
    // whose games are over 
    function performUpkeep(bytes calldata /* performData */) external override {
        // address owner = address(this);
        // require(
        //     LINK.balanceOf(owner) >= chainlinkFee,
        //     "Not enough LINK"
        // );
         (bool upkeepNeeded, ) = checkUpkeep("");
        require(upkeepNeeded, "Upkeep not needed");
        lastTimeStamp = block.timestamp;
        uint256 total = lostCharacters.length;
        for (uint256 i; i < total; i++) {
            uint256 tokenIdOfPlayer = lostCharacters[i];
            // Reset character hp
            CharacterAttributes storage player = nftHolderAttributes[tokenIdOfPlayer];
            player.hp = player.maxHp;

            // Reset boss hp 
            BigBoss storage boss = playerToBoss[ownerOf(tokenIdOfPlayer)];
            if (boss.hp != boss.maxHp) {
                boss.hp = boss.maxHp;
            }
        }
    }
}
