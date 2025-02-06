// Import dotenv configuration
import { config as dotEnvConfig } from "dotenv";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
dotEnvConfig();

// Import hardhat and destructure the needed components
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Deploy Implementation Contract
    const MyImplementation = await ethers.getContractFactory("ERC721Creator");
    const implementation = await MyImplementation.deploy().then(async (imp: any) => {
        await imp.waitForDeployment().then((i: any) => {
            console.log("Implementation deployed at:", i.target);
        });

        return imp;
    });

    // Deploy Beacon Contract
    const MyBeacon = await ethers.getContractFactory("Beacon");
    const beacon = await MyBeacon.deploy(implementation.target).then(async (beacon: any) => {
        await beacon.waitForDeployment();
        console.log("Beacon deployed at:", beacon.target);
    });

    // Deploy Beacon Proxy Contract 
    // from UI
    // const MyBeaconProxy = await ethers.getContractFactory("MyBeaconProxy");
    // const proxy = await MyBeaconProxy.deploy(beacon.address, "0x");
    // await proxy.deployed();
    // await proxy.initialize();
    // console.log("Beacon Proxy deployed at:", proxy.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


    // sepolia
    // Implementation deployed at: 0x79EeAF2e0D90F5D35AD1d79e8dd382B6BB0ef1A6
    // Beacon deployed at: 0x239C4c571bc8725245E554e5cf678a8508a71b53