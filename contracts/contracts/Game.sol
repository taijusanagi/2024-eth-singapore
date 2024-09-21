// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Game {
    struct Player {
        uint256 x;
        uint256 y;
        uint256 resources;
        uint256 energy;
    }

    struct Monster {
        uint256 x;
        uint256 y;
    }

    struct Resource {
        uint256 x;
        uint256 y;
    }

    mapping(address => uint256) public senderToPlayerIndexes;
    mapping(uint256 => Player) public players;

    uint256 public playerCount;
    uint256 public mapSize = 180;
    uint256 public initialResources = 100;
    uint256 public initialEnergy = 100;

    uint256 public maxResourceCount = 20;
    uint256 public maxEnemyCount = 20;

    Monster[] public monsters;
    Resource[] public resources;

    constructor() {
        _spawnMonstersAndResources();
    }

    function close() public {}

    function spawn() public {
        require(
            senderToPlayerIndexes[msg.sender] == 0,
            "Player already exists"
        );
        uint256 playerId = ++playerCount;
        senderToPlayerIndexes[msg.sender] = playerId;

        (uint256 randomX, uint256 randomY) = _getRandomCoordinates(playerId);
        players[playerId] = Player(
            randomX,
            randomY,
            initialResources,
            initialEnergy
        );
    }

    function harvest() public {}

    function fight() public {}

    function getPlayerByAddress(
        address playerAddress
    ) public view returns (Player memory) {
        return players[senderToPlayerIndexes[playerAddress]];
    }

    function _spawnMonstersAndResources() internal {
        for (uint256 i = 0; i < maxEnemyCount; i++) {
            (uint256 monsterX, uint256 monsterY) = _getRandomCoordinates(i);
            monsters.push(Monster(monsterX, monsterY));
        }

        for (uint256 i = 0; i < maxResourceCount; i++) {
            (uint256 resourceX, uint256 resourceY) = _getRandomCoordinates(
                i + maxEnemyCount
            );
            resources.push(Resource(resourceX, resourceY));
        }
    }

    function _random(
        uint256 seed,
        uint256 playerIndex
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        blockhash(block.number - 1),
                        seed,
                        playerIndex
                    )
                )
            );
    }

    function _getRandomCoordinates(
        uint256 playerIndex
    ) internal view returns (uint256, uint256) {
        uint256 randX = _random(1, playerIndex) % mapSize;
        uint256 randY = _random(2, playerIndex) % mapSize;
        return (randX, randY);
    }
}
