// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

abstract contract Core {
    address internal constant FEE_DISTRIBUTION =
        0xD99ce3201D3Caa7eD099d01947312dfe86Daaa23;

    struct TokenData {
        address owner;
        string uri;
        address receivers;
        uint royalty;
    }

    string internal _name;
    string internal _symbol;
    string internal _baseTokenURI;
    uint256 internal _tokenCount;

    // Mapping from token ID to token data
    mapping(uint256 => TokenData) internal _tokenData;

    // Mapping for individual token URIs
    mapping(uint256 => string) internal _tokenURIs;

    function rando(uint max) internal view returns (uint) {
        uint random;

        random =
            (uint(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, _tokenCount)
                )
            ) % max) +
            1;

        return random;
    }

    function toString(bytes32 byt) internal pure returns (string memory) {
        string memory converted = string(abi.encodePacked(byt));
        return converted;
    }

    function stringToBytes32(
        string memory source
    ) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    uint256[50] __gap;
}
