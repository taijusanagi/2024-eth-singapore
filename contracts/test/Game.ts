import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import hre from "hardhat";

describe("Game", function () {
  async function fixture() {
    const [account1, account2, account3] = await hre.ethers.getSigners();

    const Game = await hre.ethers.getContractFactory("Game");
    const game = await Game.deploy();

    return { game, account1, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { game } = await loadFixture(fixture);
      console.log("address", await game.getAddress());
    });
  });

  describe("Functions", function () {
    it("Should work", async function () {
      const { game, account1 } = await loadFixture(fixture);
      await game.connect(account1).spawn();

      const mapBeforeMovement = await game.getMap();
      visualizeMap(mapBeforeMovement);

      console.log(
        "Player Data:",
        await game.getPlayerByAddress(account1.address)
      );

      console.log(
        "Nearest Resource:",
        await game.getNearestResource(account1.address)
      );

      await game.harvest();

      console.log(
        "Player Data:",
        await game.getPlayerByAddress(account1.address)
      );

      console.log(
        "Nearest Monster:",
        await game.getNearestMonster(account1.address)
      );

      await game.fight();

      console.log(
        "Player Data:",
        await game.getPlayerByAddress(account1.address)
      );

      const mapAfterMovement = await game.getMap();
      visualizeMap(mapAfterMovement);

      // visalise the map
    });
  });
});

function visualizeMap(map: any) {
  let output = "";

  // Iterate over the 100x100 map array
  for (let y = 0; y < 100; y++) {
    let row = "";
    for (let x = 0; x < 100; x++) {
      const cell = map[x][y]; // Access map based on x and y

      if (cell === BigInt(1)) {
        row += "P"; // Player
      } else if (cell === BigInt(2)) {
        row += "R"; // Resource
      } else if (cell === BigInt(3)) {
        row += "M"; // Monster
      } else {
        row += "."; // Empty space
      }
    }
    output += row + "\n"; // Newline after each row
  }

  console.log(output); // Output the entire map as a visualized grid
}
