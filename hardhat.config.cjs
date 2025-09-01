require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: "https://eth-holesky.g.alchemy.com/v2/-aQQta2KHRN-wz0EUujVL",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: "YTZ7IJSYB1DW278TVNB4U3NWW9YNCWGUDR",
  },
};
console.log("Private key:", process.env.PRIVATE_KEY);
