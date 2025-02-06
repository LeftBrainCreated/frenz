// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;

/**
 * @title: ERC721 Contract Creator
 * @dev: leftbrain
 * @dev Deployment and Distribution for FlowFrenzNFT Mp
 */

// mint: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2","https://ipfs.leftbrain.ninja/ipfs/QmeikMHJbjTeoXg7hTJGCwXX5t3e2RET8DyZ8PNChz3av9/44"
// init: "ff-test","FFT"

//
// *************************************************************************/
// 88                  ,dPPYba,  88
// 88                88P'    '8  88
// 88                88          88
// 88  ,adPPYYba, ,adPPPPP88  dPPPPP88
// 88  88P    `Y8    8Y          88
// 88  PPdPPPPP88    88          88
// 88  88,           88          88
// 8Y  `"8bbdP"Y^    8Y          8Y
//
// 88                                88
// 88                                ""
// 88
// 88,dPPYba,  8b,dPPYba, ,adPPYYba, 88 8b,dPPYba,
// 88P'    "8a 88P'   "8a 88P'   `Y8 88 88P'   `"8a
// 88       d8 88         ,adPPPPP88 88 88       88
// 88b,   ,a8" 88         88,    ,88 88 88       88
// 8Y"Ybbd8"'  88         `"8bbdP"Y8 88 88       88
// *************************************************************************/

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {CollectionManager} from "./imports/Collection_Manager.sol";

contract ERC721CreatorV2 is
    Initializable,
    OwnableUpgradeable,
    CollectionManager
{
    uint256[] private _defaultRoyalty;
    address payable[] private _defaultReceivers;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _symbol
    ) external initializer {
        __ERC721_init(_name, _symbol);
        __ERC721Enumerable_init();
        __Ownable_init(msg.sender);

        _baseTokenURI = "ipfs://";
        _tokenCount = 0;
    }

}
