// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IAdminControl.sol";

abstract contract AdminControl is OwnableUpgradeable, IAdminControl, ERC165 {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    EnumerableSetUpgradeable.AddressSet private _admins;
    address internal _devWallet;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IAdminControl).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    modifier adminRequired() {
        require(
            owner() == msg.sender || _admins.contains(msg.sender),
            "AdminControl: Must be owner or admin"
        );
        _;
    }

    function isAdmin(address admin) public view override returns (bool) {
        return (owner() == admin || _admins.contains(admin));
    }

    function getAdmins()
        external
        view
        override
        returns (address[] memory admins)
    {
        admins = new address[](_admins.length());
        for (uint i = 0; i < _admins.length(); i++) {
            admins[i] = _admins.at(i);
        }
        return admins;
    }

    function approveAdmin(address admin) external override onlyOwner {
        if (!_admins.contains(admin)) {
            emit AdminApproved(admin, msg.sender);
            _admins.add(admin);
        }
    }

    function revokeAdmin(address admin) external override onlyOwner {
        if (_admins.contains(admin)) {
            emit AdminRevoked(admin, msg.sender);
            _admins.remove(admin);
        }
    }

    function updateDevWallet(address newDev) external onlyOwner {
        _devWallet = newDev;
    }

    // ICE
    function withdrawAll(address to) public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        _widthdraw(to, address(this).balance);
    }

    // ICE
    function withdrawToken(
        address _tokenContract,
        uint256 _amount
    ) external onlyOwner {
        IERC20 tokenContract = IERC20(_tokenContract);

        tokenContract.transfer(msg.sender, _amount);
    }

    function _widthdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }
}
