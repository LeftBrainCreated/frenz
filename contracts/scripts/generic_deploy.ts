// const { Contract } = require("ethers");
// const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");


async function main() {
  const cSock = await hre.ethers.deployContract("StonkSock");

  await cSock.waitForDeployment();

  await cSock.getAddress().then(async (addy: any) => {

    console.log("Contract deployed to:", await addy);
  });
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});