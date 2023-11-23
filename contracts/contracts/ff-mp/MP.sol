// SPDX-License-Identifier: MIT

/**
 * @title: ERC721 Contract Creator
 * @dev: leftbrain
 */

pragma solidity ^0.8.17;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {NAMELESSTransactionMgr} from "./functionality/TransactionsMgr.sol";

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

contract NAMELESS is
  Initializable,
  OwnableUpgradeable,
  NAMELESSTransactionMgr
{
  // /// @custom:oz-upgrades-unsafe-allow constructor
  // constructor() {
  //   _disableInitializers();
  // }

  function initialize(address dw) public initializer {
    OwnableUpgradeable.__Ownable_init();
    __ReentrancyGuard_init();
    _devWallet = dw;
  }
}
