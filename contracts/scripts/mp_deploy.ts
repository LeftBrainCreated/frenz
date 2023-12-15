const { Contract } = require("ethers");
const { ethers, upgrades } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("NAMELESS");
  const ct = await upgrades.deployProxy(Contract, ["0xD99ce3201D3Caa7eD099d01947312dfe86Daaa23"]);
  await ct.waitForDeployment();
  await ct.getAddress().then(async (addy: any) => {
    const imp = await Contract.attach(await upgrades.erc1967.getImplementationAddress(addy));

    console.log("Proxy deployed to:", await ct.getAddress());
    console.log("Implementation Deployed to: ", await imp.getAddress());

    await imp.initialize("0xD99ce3201D3Caa7eD099d01947312dfe86Daaa23").then(() => {
      console.log('Implementation Initialized');
    });
  });
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});