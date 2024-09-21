import hre from "hardhat";

async function main() {
  const Game = await hre.ethers.getContractFactory("Game");
  const game = await Game.deploy();
  const address = await game.getAddress();
  console.log("Game deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
