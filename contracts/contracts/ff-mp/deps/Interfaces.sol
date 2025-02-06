// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ****************/
//
// 88 88
// 88 88
// 88 88
// 88 88,dPPYba,
// 88 88P'    "8a
// 88 88       d8
// 88 88b,   ,a8"
// 8Y 8Y"Ybbd8"'
//
// ****************/

import "@openzeppelin/contracts-upgradeable/interfaces/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

interface NFTGeneric is IERC721Upgradeable, IERC2981Upgradeable {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address, uint256);
}

interface RoyaltyManager {
    function getRoyalty(
        address contractAddress,
        uint tokenId,
        uint grossSaleValue
    ) external returns (address, uint256);
}
