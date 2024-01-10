// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import {Core} from "./CoreValues.sol";

abstract contract CollectionManager is OwnableUpgradeable, Core {
    function init(address owner) internal {
        __Ownable_init(owner);
    }

    // function tokenMint(address to, uint tokenId) internal {
    // }

    // } _exists(
    //     uint256 tokenId
    // ) internal view virtual override returns (bool) {
    //     return tokenId > 0 && tokenId <= _tokenCount;
    // }

    // function supportsInterface(
    //     bytes4 interfaceId
    // )
    //     public
    //     view
    //     virtual
    //     override(ERC721Upgradeable)
    //     returns (bool)
    // {
    //     super.supportsInterface(interfaceId);
    // }
}
