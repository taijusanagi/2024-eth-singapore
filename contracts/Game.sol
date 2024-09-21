// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameContract {
    // Constants
    uint256 public constant MAP_SIZE = 200;
    uint256 public constant SECTION_SIZE = 100;
    uint256 public constant NUM_SECTIONS = 4;
    uint256 public constant RESOURCE_SPAWN_INTERVAL = 2 minutes;
    uint256 public constant MAX_RESOURCES = 500;
    uint256 public constant STARTING_RESOURCES = 50;
    uint256 public  STARTING_ENERGY = 100;
    uint256 public constant FARM_ENERGY_COST = 10;
    uint256 public MONSTER_RESOURCES = 10;

    // Structs
    struct Player {
        uint256 x;
        uint256 y;
        uint256 resources;
        uint256 energy;
        uint256 sectionChoice;
        bool isAlive;
    }

    struct Monster {
        uint256 x;
        uint256 y;
        uint256 health;
    uint256 resources;
    }

    struct Resource {
        uint256 x;
        uint256 y;
        uint256 amount;
    }

    

    // State variables
    mapping(address => Player) public players;
    Monster[4] public monsters;
    Resource[] public resources; 
    uint256 public lastResourceSpawnTime;
    address public gameManager;

    // Events
    event PlayerSpawned(address indexed player, uint256 x, uint256 y, uint256 sectionChoice);
    event ResourceFarmed(address indexed player, uint256 amount, uint256 newTotal, uint256 energyLeft);
    event MonsterKilled(address indexed player, uint256 monsterIndex, uint256 resourcesGained);
    event PlayerBattleResult(address indexed attacker, address indexed defender, address winner, uint256 resourcesWon);
     event ResourceSpawned(uint256 x, uint256 y, uint256 amount);

    // Constructor
     constructor() {
        // Initialize monsters on diagonals with 100 health and 10 resources each
        gameManager = msg.sender;
        monsters[0] = Monster(25, 25, 100, 10);
        monsters[1] = Monster(175, 25, 100, 10);
        monsters[2] = Monster(25, 175, 100, 10);
        monsters[3] = Monster(175, 175, 100, 10);

        lastResourceSpawnTime = block.timestamp;
    }

  modifier onlyGameManager() {
        require(msg.sender == gameManager, "Only game manager can call this function");
        _;
    }

    // Functions
    function startGame(uint256 _sectionChoice) external {
        require(_sectionChoice < NUM_SECTIONS, "Invalid section choice");
        require(!players[msg.sender].isAlive, "Player already in game");

        uint256 spawnX = random(SECTION_SIZE) + (_sectionChoice % 2) * SECTION_SIZE;
        uint256 spawnY = random(SECTION_SIZE) + (_sectionChoice / 2) * SECTION_SIZE;

        players[msg.sender] = Player(spawnX, spawnY, STARTING_RESOURCES, STARTING_ENERGY, _sectionChoice, true);
        emit PlayerSpawned(msg.sender, spawnX, spawnY, _sectionChoice);
        spawnResourcesIfNeeded();
    }

    function farm() external {
        Player storage player = players[msg.sender];
        require(player.isAlive, "Player not in game");
         require(player.energy >= FARM_ENERGY_COST, "Not enough energy to farm");
         spawnResourcesIfNeeded();

        require(resources.length>0, "No resources available");
        uint256 resourceIndex = findNearestResource(player.x, player.y);
       

        Resource storage nearestResource = resources[resourceIndex];
        player.resources += nearestResource.amount;
        player.energy -= FARM_ENERGY_COST;
        player.x = nearestResource.x;
        player.y = nearestResource.y;

        emit ResourceFarmed(msg.sender, nearestResource.amount, player.resources, player.energy);

        // Remove the farmed resource
        resources[resourceIndex] = resources[resources.length - 1];
        resources.pop();
    }

    function killMonster() external {
        Player storage player = players[msg.sender];
        require(player.isAlive, "Player not in game");

        uint256 monsterIndex = findNearestMonster(player.x, player.y);
        require(monsterIndex < 4, "No monsters available");
        require(player.resources >= monsters[monsterIndex].health, "Not enough resources to kill monster");

         uint256 resourcesGained = monsters[monsterIndex].resources;
        player.resources = player.resources - monsters[monsterIndex].health + resourcesGained;
        monsters[monsterIndex].health = 0;
        monsters[monsterIndex].resources = 0;
        monsters[monsterIndex].health = 0;

        emit MonsterKilled(msg.sender, monsterIndex, resourcesGained);
        spawnResourcesIfNeeded();
    }

    function attackPlayer(address _target) external {
        Player storage attacker = players[msg.sender];
        Player storage defender = players[_target];

        require(attacker.isAlive && defender.isAlive, "Both players must be alive");
       address winner;
        address loser;
        uint256 resourcesWon;

        if (attacker.resources > defender.resources) {
            winner = msg.sender;
            loser = _target;
            resourcesWon = defender.resources;
        } else {
            winner = _target;
            loser = msg.sender;
            resourcesWon = attacker.resources;
        }

         players[winner].resources += resourcesWon;
        players[loser].resources = 0;
        players[loser].isAlive = false;

        emit PlayerBattleResult(msg.sender, _target, winner, resourcesWon);
        spawnResourcesIfNeeded();
    }

  function spawnResourcesIfNeeded() public {
        if (block.timestamp >= lastResourceSpawnTime + RESOURCE_SPAWN_INTERVAL || resources.length ==0) {
            uint256 numToSpawn = MAX_RESOURCES - resources.length;
            for (uint256 i = 0; i < numToSpawn; i++) {
                uint256 x = random(MAP_SIZE);
                uint256 y = random(MAP_SIZE);
                uint256 amount = random(50) + 10; // Random amount between 10 and 59
                resources.push(Resource(x, y, amount));
                emit ResourceSpawned(x, y, amount);
            }
            lastResourceSpawnTime = block.timestamp;
        }
    }



    // Helper functions
    function findNearestResource(uint256 _x, uint256 _y) internal view returns (uint256) {
        require(resources.length > 0, "No resources available");
        uint256 nearestIndex = 0;
        uint256 shortestDistance = type(uint256).max;

        for (uint256 i = 0; i < resources.length; i++) {
            uint256 distance = calculateDistance(_x, _y, resources[i].x, resources[i].y);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestIndex = i;
            }
        }

        return (nearestIndex);
    }

    function findNearestMonster(uint256 _x, uint256 _y) internal view returns (uint256) {
        uint256 nearestIndex = 0;
        uint256 shortestDistance = type(uint256).max;

        for (uint256 i = 0; i < 4; i++) {
            if (monsters[i].health > 0) {
                uint256 distance = calculateDistance(_x, _y, monsters[i].x, monsters[i].y);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestIndex = i;
                }
            }
        }

        return (nearestIndex);
    }

    function calculateDistance(uint256 _x1, uint256 _y1, uint256 _x2, uint256 _y2) internal pure returns (uint256) {
        uint256 dx = _x1 > _x2 ? _x1 - _x2 : _x2 - _x1;
        uint256 dy = _y1 > _y2 ? _y1 - _y2 : _y2 - _y1;
        return dx + dy; // Manhattan distance
    }

     function random(uint256 _modulus) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % _modulus;
    }
}