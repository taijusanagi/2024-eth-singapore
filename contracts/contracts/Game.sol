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

    uint256 public worldIndex;
    uint256 public playerCount;
    uint256 public mapSize = 180;
    uint256 public initialResources = 100;
    uint256 public initialEnergy = 100;
    uint256 public maxResourceCount = 20;
    uint256 public maxEnemyCount = 20;

    // Mapping world index to players, monsters, and resources
    mapping(uint256 => mapping(address => uint256))
        public senderToPlayerIndexes;
    mapping(uint256 => mapping(uint256 => Player)) public players;
    mapping(uint256 => Monster[]) public monsters;
    mapping(uint256 => Resource[]) public resources;

    constructor() {
        _generateWorld();
    }

    // this method should be protected by game system in prod
    function generate() public {
        _generateWorld();
    }

    function spawn() public {
        require(
            senderToPlayerIndexes[worldIndex][msg.sender] == 0,
            "Player already exists in this world"
        );
        uint256 playerId = ++playerCount;
        senderToPlayerIndexes[worldIndex][msg.sender] = playerId;

        (uint256 randomX, uint256 randomY) = _getRandomCoordinates(playerId);
        players[worldIndex][playerId] = Player(
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
        return
            players[worldIndex][
                senderToPlayerIndexes[worldIndex][playerAddress]
            ];
    }

    // Internal function to generate monsters and resources for the current world
    function _generateWorld() internal {
        uint256 worldId = ++worldIndex; // Increment the world index
        playerCount = 0; // Reset player count for the new world

        // Spawn monsters for the new world
        for (uint256 i = 0; i < maxEnemyCount; i++) {
            (uint256 monsterX, uint256 monsterY) = _getRandomCoordinates(i);
            monsters[worldId].push(Monster(monsterX, monsterY));
        }

        // Spawn resources for the new world
        for (uint256 i = 0; i < maxResourceCount; i++) {
            (uint256 resourceX, uint256 resourceY) = _getRandomCoordinates(
                i + maxEnemyCount
            );
            resources[worldId].push(Resource(resourceX, resourceY));
        }
    }

    // Helper function to get a pseudo-random number based on blockhash and seed
    function _random(
        uint256 index,
        uint256 seed
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(blockhash(block.number - 1), index, seed)
                )
            );
    }

    // Function to randomly assign a position (x, y) on the map
    function _getRandomCoordinates(
        uint256 seed
    ) internal view returns (uint256, uint256) {
        uint256 randX = _random(1, seed) % mapSize; // Random x between 0 and mapSize-1
        uint256 randY = _random(2, seed) % mapSize; // Random y between 0 and mapSize-1
        return (randX, randY);
    }
}
