// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author: leftbrain

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @dev Interface for admin control
 */
interface IAdminControl is IERC165 {

    event AdminApproved(address indexed account, address indexed sender);
    event AdminRevoked(address indexed account, address indexed sender);

    function isAdmin(address admin) external view returns (bool);
    function getAdmins() external view returns (address[] memory);
    function approveAdmin(address admin) external;
    function revokeAdmin(address admin) external;
}