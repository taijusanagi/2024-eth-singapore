import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Game", function () {
  async function fixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Game = await hre.ethers.getContractFactory("Game");
    const game = await Game.deploy();

    return { game, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { game } = await loadFixture(fixture);
      console.log("address", await game.getAddress());
    });
  });

  describe("Functions", function () {
    it("Should work", async function () {
      const { game, owner } = await loadFixture(fixture);
      await game.spawn();
      console.log(await game.getPlayerByAddress(owner.address));
      await expect(game.spawn()).to.be.rejectedWith("Player already exists");

      console.log(await game.getNearestMonster(owner.address));
      console.log(await game.getNearestResource(owner.address));
    });
  });
});
