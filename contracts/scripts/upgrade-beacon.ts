// Import dotenv configuration
import { config as dotEnvConfig } from "dotenv";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
dotEnvConfig();

// Import hardhat and destructure the needed components
const { ethers, upgrades } = require("hardhat");

const beaconAddress = '0x239C4c571bc8725245E554e5cf678a8508a71b53';


async function upgradeImplementation() {
// Deploy Implementation Contract
const MyImplementation = await ethers.getContractFactory("ERC721CreatorV2");
await MyImplementation.deploy().then(async (imp: any) => {
    await imp.waitForDeployment().then((i: any) => {
        console.log("Implementation deployed at:", i.target);
    });

    const newImplementationAddress = imp.target;
    
    const MyBeacon = await ethers.getContractAt("Beacon", beaconAddress);
    await MyBeacon.upgradeTo(newImplementationAddress);
    console.log("Beacon upgraded to new implementation at:", newImplementationAddress);
});

}

upgradeImplementation()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


