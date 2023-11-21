// SPDX-License-Identifier: MIT

/**
* @title: ERC721 Contract Creator
* @dev: leftbrain
*/

pragma solidity ^0.8.17;

import { AdminControl } from "./admin-controls/AdminControl.sol";
import { Core } from "./core/Core.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC721Core} from "./token/ERC721/ERC721Core.sol";
import {ERC721Upgradeable} from "./token/ERC721/ERC721Upgradeable.sol";


contract ERC721Creator is Initializable, AdminControl, ERC721Upgradeable, Core {
    using EnumerableSet for EnumerableSet.AddressSet;

    constructor() {
        _disableInitializers();
    }
    
    /**
     * Initializer
     */
    function initialize(string memory _name, string memory _symbol) public initializer {
        __ERC721_init(_name, _symbol);
        __Ownable_init();

        _tokenCount = 0;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Core, AdminControl, Core)
        returns (bool)
    {
        return Core.supportsInterface(interfaceId) || ERC721Core.supportsInterface(interfaceId)
            || AdminControl.supportsInterface(interfaceId);
    }

    function _setTokenURI(uint256 tokenId, string calldata uri) internal {
        require(tokenId > 0 && tokenId <= _tokenCount, "Invalid token");
        _tokenURIs[tokenId] = uri;
    }

    /**
     * @dev See {ICreatorCore-setRoyalties}.
     */
    function setRoyalties(address payable[] calldata receivers, uint256[] calldata basisPoints)
        external
        override
        adminRequired
    {
        require(true == false, "Not Implemented");
    }

    /**
     * @dev See {ICreatorCore-setRoyalties}.
     */
    function setRoyalties(uint256 tokenId, address payable[] calldata receivers, uint256[] calldata basisPoints)
        external
        override
        adminRequired
    {
        require(_exists(tokenId), "Nonexistent token");
        _setRoyalties(tokenId, receivers, basisPoints);
    }

    /**
     * @dev See {ICreatorCore-getRoyalties}.
     */
    function getRoyalties(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address payable[] memory, uint256[] memory)
    {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyalties(tokenId);
    }

    /**
     * @dev See {ICreatorCore-getFees}.
     */
    function getFees(uint256 tokenId)
        external
        view
        virtual
        override
        returns (address payable[] memory, uint256[] memory)
    {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyalties(tokenId);
    }

    /**
     * @dev See {ICreatorCore-getFeeRecipients}.
     */
    function getFeeRecipients(uint256 tokenId) external view virtual override returns (address payable[] memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyaltyReceivers(tokenId);
    }

    /**
     * @dev See {ICreatorCore-getFeeBps}.
     */
    function getFeeBps(uint256 tokenId) external view virtual override returns (uint256[] memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyaltyBPS(tokenId);
    }

    /**
     * @dev See {ICreatorCore-royaltyInfo}.
     */
    function royaltyInfo(uint256 tokenId, uint256 value) external view virtual override returns (address, uint256) {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyaltyInfo(tokenId, value);
    }

    /**
     * @dev See {IERC721CreatorCore-tokenData}.
     */
    function tokenData(uint256 tokenId) external view returns (uint80) {
        return uint80(_tokenData[tokenId].data >> 16);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _tokenURI(tokenId);
    }

}