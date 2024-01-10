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

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {ERC721RoyaltyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";

import {CollectionManager} from "./imports/Collection_Manager.sol";
import {DistributionManager} from "./imports/Distribution_Manager.sol";

contract ERC721Creator is
    Initializable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    ERC721RoyaltyUpgradeable,
    CollectionManager,
    DistributionManager
{
    uint256[] private _defaultRoyalty;
    address payable[] private _defaultReceivers;

    function initialize(
        string memory _name,
        string memory _symbol
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __ERC721Enumerable_init();
        CollectionManager.init(msg.sender);

        _baseTokenURI = "ipfs://";
        _tokenCount = 0;
    }

    function mintToken(
        address to,
        string calldata uri
    ) external AdminOnly returns (uint) {
        uint newTokenId = _tokenCount + 1;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        _tokenCount++;

        return newTokenId;
    }

    // fee denominator = 10000
    function setDefaultRoyalty(
        address receiver,
        uint96 numerator
    ) external AdminOnly {
        _setDefaultRoyalty(receiver, numerator);
    }

    function deleteDefaultRoyalty() external AdminOnly {
        _deleteDefaultRoyalty();
    }

    function setTokenRoyalty(
        uint tokenId,
        address receiver,
        uint96 numerator
    ) external AdminOnly {
        _setTokenRoyalty(tokenId, receiver, numerator);
    }

    function resetTokenRoyalty(uint tokenId) external AdminOnly {
        _resetTokenRoyalty(tokenId);
    }

    function setBaseUri(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function totalSupply() public view override returns (uint256) {
        return _tokenCount;
    }

    function _burn(
        uint256 tokenId
    )
        internal
        virtual
        override(
            ERC721URIStorageUpgradeable,
            ERC721Upgradeable,
            ERC721RoyaltyUpgradeable
        )
    {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    )
        internal
        virtual
        override(ERC721EnumerableUpgradeable, ERC721Upgradeable)
    {
        _beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721EnumerableUpgradeable,
            ERC721RoyaltyUpgradeable,
            ERC721URIStorageUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(
        address account,
        uint128 value
    )
        internal
        virtual
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._increaseBalance(account, value);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        virtual
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
