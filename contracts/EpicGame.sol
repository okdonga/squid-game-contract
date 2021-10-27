//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract EpicGame {
    // A struct holds all the character's attributes 
    struct CharacterAttributes {
        uint characterIndex;
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    CharacterAttributes[] defaultCharacters;

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint[] memory characterHp,
        uint[] memory characterAttackDmg
    ) {
        console.log("Deploying a EpicGame contract");
        for (uint i = 0; i < characterNames.length; i++) {
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

            CharacterAttributes memory c = defaultCharacters[i];
            console.log("Done initializing %s w/ HP %s, igmg %s", c.name, c.hp, c.imageURI);
        }
    }
}
