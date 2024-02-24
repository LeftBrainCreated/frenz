const { ethers, upgrades } = require("hardhat");

async function main() {

    const CFactory = await ethers.getContractFactory("ERC721Creator");
    const beaconProxy1 = await upgrades.deployBeaconProxy("0xF1Df2f7c11Aeda67922B56f979846598d3709389", CFactory);


    // upgrades.deployBeacon(CFactory, { unsafeAllow: ['constructor'] })
    //     .then(async (beacon) => {
    //         console.log(`Beacon as implementation is deployed to address: ${beacon.target}`);
    //         const beaconProxy1 = await upgrades.deployBeaconProxy("0xF1Df2f7c11Aeda67922B56f979846598d3709389", CFactory);

    //         console.log(`Proxy Address: ${beaconProxy1.target}`);

    //         // await beaconProxy1.initialize();



    //     });
}

async function main() {

    const AdminControl_v1 = await ethers.getContractFactory("ERC721Creator");
    const BEACON = '0x8712B29eb93baAE1Bd0007DFE834CE972488a1F0';

    console.log(`Beacon as implementation is deployed to address: ${BEACON}`);

    const beaconProxy1 = await upgrades.deployBeaconProxy(BEACON, AdminControl_v1, ["TST", "Testing"]);

    console.log(`Proxy Address: ${beaconProxy1.target}`);
}


// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});