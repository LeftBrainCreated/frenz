// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract AdminControl is OwnableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _admins;

    event AdminApproved(address indexed account, address indexed sender);
    event AdminRevoked(address indexed account, address indexed sender);

    modifier AdminOnly() {
        require(
            owner() == msg.sender || _admins.contains(msg.sender),
            "AdminControl: Must be owner or admin"
        );
        _;
    }

    function isAdmin(address admin) public view returns (bool) {
        return (owner() == admin || _admins.contains(admin));
    }

    function getAdmins() external view returns (address[] memory admins) {
        admins = new address[](_admins.length());
        for (uint i = 0; i < _admins.length(); i++) {
            admins[i] = _admins.at(i);
        }
        return admins;
    }

    function approveAdmin(address admin) external onlyOwner {
        if (!_admins.contains(admin)) {
            emit AdminApproved(admin, msg.sender);
            _admins.add(admin);
        }
    }

    function revokeAdmin(address admin) external onlyOwner {
        if (_admins.contains(admin)) {
            emit AdminRevoked(admin, msg.sender);
            _admins.remove(admin);
        }
    }
}
