import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_ENDPOINT_L1 as string,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
