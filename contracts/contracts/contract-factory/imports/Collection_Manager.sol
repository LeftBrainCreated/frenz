// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {ERC721RoyaltyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {AdminControl} from "./AdminControl.sol";
import {Core} from "./CoreValues.sol";

abstract contract CollectionManager is
    ERC721URIStorageUpgradeable,
    ERC721RoyaltyUpgradeable,
    ERC721EnumerableUpgradeable,
    Core,
    AdminControl
{

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

    function setBaseUri(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    )
        internal
        virtual
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Override _burn
    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721Upgradeable, ERC721RoyaltyUpgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    //  function _increaseBalance(address account, uint128 amount) internal virtual override (ERC721Upgradeable, ERC721EnumerableUpgradeable) {
    //     super._increaseBalance(account, amount);
    //  }

    // function _update(address to, uint256 tokenId, address auth) internal virtual override (ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (address) {
    //     super._update(to, tokenId, auth);
    // }

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

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(
            ERC721Upgradeable, 
            ERC721URIStorageUpgradeable
        ) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
