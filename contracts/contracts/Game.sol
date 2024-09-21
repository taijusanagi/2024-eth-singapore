// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Game {
    struct Player {
        uint256 x;
        uint256 y;
        uint256 resources;
        uint256 energy;
    }

    struct OtherObject {
        uint256 x;
        uint256 y;
    }

    uint256 public worldIndex;
    uint256 public playerCount;
    uint256 public mapSize = 100;
    uint256 public initialResources = 100;
    uint256 public initialEnergy = 1000;
    uint256 public maxResourceCount = 20;
    uint256 public maxEnemyCount = 20;

    uint256 public effect = 10;

    // Mapping world index to players, monsters, and resources
    mapping(uint256 => mapping(address => uint256))
        public senderToPlayerIndexes;
    mapping(uint256 => mapping(uint256 => Player)) public players;
    mapping(uint256 => OtherObject[]) public monsters;
    mapping(uint256 => OtherObject[]) public resources;

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

    function harvest() public {
        Player storage player = players[worldIndex][
            senderToPlayerIndexes[worldIndex][msg.sender]
        ];
        require(player.energy > 0, "Not enough energy to harvest");

        (
            uint256 distance,
            uint256 resourceX,
            uint256 resourceY,

        ) = getNearestResource(msg.sender);
        require(distance > 0, "No resources available");

        // Move to the resource
        _move(player, resourceX, resourceY);

        // Add resources and remove the harvested resource from the map
        player.resources += effect;
        _removeResource(resourceX, resourceY);
    }

    function fight() public {
        Player storage player = players[worldIndex][
            senderToPlayerIndexes[worldIndex][msg.sender]
        ];
        require(player.energy > 0, "Not enough energy to fight");

        (
            uint256 distance,
            uint256 monsterX,
            uint256 monsterY,

        ) = getNearestMonster(msg.sender);
        require(distance > 0, "No monsters available");

        // Move to the monster
        _move(player, monsterX, monsterY);

        // Simulate combat (simplified version)
        player.resources += effect;
        _removeMonster(monsterX, monsterY);
    }

    function _move(
        Player storage player,
        uint256 targetX,
        uint256 targetY
    ) internal {
        uint256 distance = _manhattanDistance(
            player.x,
            player.y,
            targetX,
            targetY
        );
        require(player.energy >= distance, "Not enough energy to move");

        player.energy -= distance;
        player.x = targetX;
        player.y = targetY;
    }

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
            monsters[worldId].push(OtherObject(monsterX, monsterY));
        }

        // Spawn resources for the new world
        for (uint256 i = 0; i < maxResourceCount; i++) {
            (uint256 resourceX, uint256 resourceY) = _getRandomCoordinates(
                i + maxEnemyCount
            );
            resources[worldId].push(OtherObject(resourceX, resourceY));
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

    function getMap() public view returns (uint256[100][100] memory) {
        uint256[100][100] memory map;

        // Place players on the map (represented as 1)
        for (uint256 i = 1; i <= playerCount; i++) {
            Player memory player = players[worldIndex][i];
            map[player.x][player.y] = 1;
        }

        // Place resources on the map (represented as 2)
        OtherObject[] memory worldResources = resources[worldIndex];
        for (uint256 i = 0; i < worldResources.length; i++) {
            OtherObject memory resource = worldResources[i];
            map[resource.x][resource.y] = 2;
        }

        // Place monsters on the map (represented as 3)
        OtherObject[] memory worldMonsters = monsters[worldIndex];
        for (uint256 i = 0; i < worldMonsters.length; i++) {
            OtherObject memory monster = worldMonsters[i];
            map[monster.x][monster.y] = 3;
        }

        // The rest of the map remains 0 by default
        return map;
    }

    // Get nearest monster to player
    function getNearestMonster(
        address playerAddress
    )
        public
        view
        returns (uint256 distance, uint256 x, uint256 y, uint256 length)
    {
        Player memory player = getPlayerByAddress(playerAddress);
        OtherObject[] memory worldMonsters = monsters[worldIndex];
        return _getNearestObject(player.x, player.y, worldMonsters);
    }

    // Get nearest resource to player
    function getNearestResource(
        address playerAddress
    )
        public
        view
        returns (uint256 distance, uint256 x, uint256 y, uint256 length)
    {
        Player memory player = getPlayerByAddress(playerAddress);
        OtherObject[] memory worldResources = resources[worldIndex];
        return _getNearestObject(player.x, player.y, worldResources);
    }

    // Internal function to calculate Manhattan distance and find the nearest object
    function _getNearestObject(
        uint256 playerX,
        uint256 playerY,
        OtherObject[] memory objects
    )
        internal
        pure
        returns (
            uint256 distance,
            uint256 nearestX,
            uint256 nearestY,
            uint256 length
        )
    {
        distance = type(uint256).max; // Initialize with max value to find the minimum distance
        length = objects.length;
        for (uint256 i = 0; i < objects.length; i++) {
            uint256 objectX = objects[i].x;
            uint256 objectY = objects[i].y;
            uint256 currentDistance = _manhattanDistance(
                playerX,
                playerY,
                objectX,
                objectY
            );

            if (currentDistance < distance) {
                distance = currentDistance;
                nearestX = objectX;
                nearestY = objectY;
            }
        }
    }

    function _manhattanDistance(
        uint256 x1,
        uint256 y1,
        uint256 x2,
        uint256 y2
    ) internal pure returns (uint256) {
        return (x1 > x2 ? x1 - x2 : x2 - x1) + (y1 > y2 ? y1 - y2 : y2 - y1);
    }

    function _removeResource(uint256 x, uint256 y) internal {
        OtherObject[] storage worldResources = resources[worldIndex];
        for (uint256 i = 0; i < worldResources.length; i++) {
            if (worldResources[i].x == x && worldResources[i].y == y) {
                worldResources[i] = worldResources[worldResources.length - 1];
                worldResources.pop();
                break;
            }
        }
    }

    function _removeMonster(uint256 x, uint256 y) internal {
        OtherObject[] storage worldMonsters = monsters[worldIndex];
        for (uint256 i = 0; i < worldMonsters.length; i++) {
            if (worldMonsters[i].x == x && worldMonsters[i].y == y) {
                worldMonsters[i] = worldMonsters[worldMonsters.length - 1];
                worldMonsters.pop();
                break;
            }
        }
    }
}
