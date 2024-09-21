import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

export const defaultHardhatKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const accounts = [process.env.PRIVATE_KEY || defaultHardhatKey];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts,
    },
    flow: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts,
    },
  },
};

export default config;
