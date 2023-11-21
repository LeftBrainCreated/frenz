// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC165, IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "./ICore.sol";

abstract contract Core is ICore, ERC165 {
    using Strings for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;
    using AddressUpgradeable for address;

    uint256 internal _tokenCount;

    // Base approve transfers address location
    address internal _approveTransferBase;

    // Mapping for individual token URIs
    mapping(uint256 => string) internal _tokenURIs;

    // Royalty configurations
    struct RoyaltyConfig {
        address payable receiver;
        uint16 bps;
    }

    mapping(uint256 => RoyaltyConfig[]) internal _tokenRoyalty;

    bytes4 private constant _CREATOR_CORE_V1 = 0x28f10a21;

    /**
     * External interface identifiers for royalties
     */

    /**
     *  @dev CreatorCore
     *
     *  bytes4(keccak256('getRoyalties(uint256)')) == 0xbb3bafd6
     *
     *  => 0xbb3bafd6 = 0xbb3bafd6
     */
    bytes4 private constant _INTERFACE_ID_ROYALTIES_CREATORCORE = 0xbb3bafd6;

    /**
     *  @dev Rarible: RoyaltiesV1
     *
     *  bytes4(keccak256('getFeeRecipients(uint256)')) == 0xb9c4d9fb
     *  bytes4(keccak256('getFeeBps(uint256)')) == 0x0ebd4c7f
     *
     *  => 0xb9c4d9fb ^ 0x0ebd4c7f = 0xb7799584
     */
    bytes4 private constant _INTERFACE_ID_ROYALTIES_RARIBLE = 0xb7799584;

    /**
     *  @dev Foundation
     *
     *  bytes4(keccak256('getFees(uint256)')) == 0xd5a06d4c
     *
     *  => 0xd5a06d4c = 0xd5a06d4c
     */
    bytes4 private constant _INTERFACE_ID_ROYALTIES_FOUNDATION = 0xd5a06d4c;

    /**
     *  @dev EIP-2981
     *
     * bytes4(keccak256("royaltyInfo(uint256,uint256)")) == 0x2a55205a
     *
     * => 0x2a55205a = 0x2a55205a
     */
    bytes4 private constant _INTERFACE_ID_ROYALTIES_EIP2981 = 0x2a55205a;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(ICore).interfaceId || interfaceId == _CREATOR_CORE_V1
            || super.supportsInterface(interfaceId) || interfaceId == _INTERFACE_ID_ROYALTIES_CREATORCORE
            || interfaceId == _INTERFACE_ID_ROYALTIES_RARIBLE || interfaceId == _INTERFACE_ID_ROYALTIES_FOUNDATION
            || interfaceId == _INTERFACE_ID_ROYALTIES_EIP2981;
    }

    function _getRoyalties(uint256 tokenId)
        internal
        view
        returns (address payable[] memory receivers, uint256[] memory bps)
    {
        // Get token level royalties
        RoyaltyConfig[] memory royalties = _tokenRoyalty[tokenId];
        if (royalties.length > 0) {
            receivers = new address payable[](royalties.length);
            bps = new uint256[](royalties.length);
            for (uint256 i; i < royalties.length;) {
                receivers[i] = royalties[i].receiver;
                bps[i] = royalties[i].bps;
                unchecked {
                    ++i;
                }
            }
        }
    }

    function _getRoyaltyReceivers(uint256 tokenId) internal view returns (address payable[] memory recievers) {
        (recievers,) = _getRoyalties(tokenId);
    }

    /**
     * Helper to get royalty basis points for a token
     */
    function _getRoyaltyBPS(uint256 tokenId) internal view returns (uint256[] memory bps) {
        (, bps) = _getRoyalties(tokenId);
    }

    function _getRoyaltyInfo(uint256 tokenId, uint256 value) internal view returns (address receiver, uint256 amount) {
        (address payable[] memory receivers, uint256[] memory bps) = _getRoyalties(tokenId);
        require(receivers.length <= 1, "More than 1 royalty receiver");

        if (receivers.length == 0) {
            return (address(this), 0);
        }
        return (receivers[0], bps[0] * value / 10000);
    }

    /**
     * Set royalties for a token
     */
    function _setRoyalties(uint256 tokenId, address payable[] calldata receivers, uint256[] calldata basisPoints)
        internal
    {
        _checkRoyalties(receivers, basisPoints);
        delete _tokenRoyalty[tokenId];
        _setRoyalties(receivers, basisPoints, _tokenRoyalty[tokenId]);
        emit RoyaltiesUpdated(tokenId, receivers, basisPoints);
    }

    /**
     * Helper function to check that royalties provided are valid
     */
    function _checkRoyalties(address payable[] calldata receivers, uint256[] calldata basisPoints) private pure {
        require(receivers.length == basisPoints.length, "Invalid input");
        uint256 totalBasisPoints;
        for (uint256 i; i < basisPoints.length;) {
            totalBasisPoints += basisPoints[i];
            unchecked {
                ++i;
            }
        }
        require(totalBasisPoints < 10000, "Invalid total royalties");
    }

    /**
     * Helper function to set royalties
     */
    function _setRoyalties(
        address payable[] calldata receivers,
        uint256[] calldata basisPoints,
        RoyaltyConfig[] storage royalties
    ) private {
        for (uint256 i; i < basisPoints.length;) {
            royalties.push(RoyaltyConfig({receiver: receivers[i], bps: uint16(basisPoints[i])}));
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev See {ICreatorCore-getApproveTransfer}.
     */
    function getApproveTransfer() external view override returns (address) {
        return _approveTransferBase;
    }

    /**
     * @dev Retrieve a token's URI
     */
    function _tokenURI(uint256 tokenId) internal view returns (string memory uri) {
        require(tokenId > 0 && tokenId <= _tokenCount, "Invalid token");

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            return _tokenURIs[tokenId];
        }

    }

}