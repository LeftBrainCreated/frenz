const { ethers, upgrades } = require("hardhat");

// async function main() {
    
//     const AdminControl_v1 = await ethers.getContractFactory("ERC721Creator");

//     upgrades.deployBeacon(AdminControl_v1, { unsafeAllow: ['constructor'] })
//         .then(async (beacon) => {
//             console.log(`Beacon as implementation is deployed to address: ${beacon.target}`);

//             const beaconProxy1 = await upgrades.deployBeaconProxy(beacon.target, AdminControl_v1, ["TST", "Testing"]);

//             console.log(`Proxy Address: ${beaconProxy1.target}`);
        
//             // await beaconProxy1.initialize();



//         });
// }

async function main() {
    
    const AdminControl_v1 = await ethers.getContractFactory("ERC721Creator");
    const BEACON = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

    console.log(`Beacon as implementation is deployed to address: ${BEACON}`);

    const beaconProxy1 = await upgrades.deployBeaconProxy(BEACON, AdminControl_v1, ["TST", "Testing"]);

    console.log(`Proxy Address: ${beaconProxy1.target}`);
}


// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});