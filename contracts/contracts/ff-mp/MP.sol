// SPDX-License-Identifier: MIT

/**
 * @title: ERC721 Contract Creator
 * @author: leftbrain
 */

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

pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {TransactionMgr} from "./functionality/TransactionsMgr.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

contract ffMp is Initializable, OwnableUpgradeable, TransactionMgr {
    function initialize(address dw) public initializer {
        OwnableUpgradeable.__Ownable_init();
        __ReentrancyGuard_init();
        _devWallet = dw;
        _platformFee = 300;
        _activeOffersCount = 0;
    }

    constructor() {
        _disableInitializers();
    }
}
