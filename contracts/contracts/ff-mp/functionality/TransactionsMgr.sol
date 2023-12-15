// SPDX-License-Identifier: MIT

/**
 * @title: ERC721 Contract Creator
 * @dev: leftbrain
 */

pragma solidity 0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AdminControl} from "../deps/AdminControl.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

error PriceNotMet(address contractAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address contractAddress, uint256 tokenId);
error NotListed(address contractAddress, uint256 tokenId);
error AlreadyListed(address contractAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

abstract contract NAMELESSTransactionMgr is
    Initializable,
    OwnableUpgradeable,
    AdminControl,
    ReentrancyGuardUpgradeable
{
    using Counters for Counters.Counter;
    //   Counters.Counter private _tokenIds;
    //   Counters.Counter private _itemsSold;
    //   uint256 listingPrice = 0.00025 ether;
    //   address payable owner;
    //   mapping(uint256 => MarketItem) private idToMarketItem;

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;
    mapping(uint256 => ListedItem) private _idToListing;
    Counters.Counter private _totalMpListings;
    Counters.Counter private _totalComplete;

    struct Listing {
        uint256 price;
        address seller;
        uint256 listingId;
    }

    struct ListedItem {
        address contractAddress;
        uint tokenId;
        Listing listing;
        bool active;
    }

    event ItemListed(
        uint256 listingId,
        address indexed seller,
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        address indexed seller,
        address indexed contractAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        address indexed buyer,
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    modifier notListed(address contractAddress, uint256 tokenId) {
        Listing memory listing = s_listings[contractAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(contractAddress, tokenId);
        }
        _;
    }

    modifier isListed(address contractAddress, uint256 tokenId) {
        Listing memory listing = s_listings[contractAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(contractAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address contractAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(contractAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }

    function cancelListing(
        address contractAddress,
        uint256 tokenId
    )
        external
        isOwner(contractAddress, tokenId, msg.sender)
        isListed(contractAddress, tokenId)
    {
        _idToListing[s_listings[contractAddress][tokenId].listingId]
            .active = false;
        delete (s_listings[contractAddress][tokenId]);
        _totalComplete.increment();

        emit ItemCanceled(msg.sender, contractAddress, tokenId);
    }

    function listItem(
        address contractAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(contractAddress, tokenId)
        isOwner(contractAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        {
            address ca = contractAddress;
            uint tId = tokenId;

            IERC721 nft = IERC721(ca);
            if (nft.getApproved(tId) != address(this)) {
                revert NotApprovedForMarketplace();
            }
            Listing memory l = Listing(
                price,
                msg.sender,
                _totalMpListings.current()
            );
            s_listings[ca][tId] = l;

            ListedItem memory li = ListedItem(ca, tId, l, true);
            _idToListing[_totalMpListings.current()] = li;
            _totalMpListings.increment();
        }

        emit ItemListed(
            _totalMpListings.current() - 1,
            msg.sender,
            contractAddress,
            tokenId,
            price
        );
    }

    function buyItem(
        address contractAddress,
        uint256 tokenId
    ) external payable isListed(contractAddress, tokenId) nonReentrant {
        Listing memory listedItem = s_listings[contractAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert PriceNotMet(contractAddress, tokenId, listedItem.price);
        }

        payable(_devWallet).transfer((listedItem.price / 1000) * 15);
        payable(listedItem.seller).transfer((listedItem.price / 100) * 97);

        _idToListing[s_listings[contractAddress][tokenId].listingId]
            .active = false;
        delete (s_listings[contractAddress][tokenId]);
        IERC721(contractAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );
        _totalComplete.increment();

        emit ItemBought(msg.sender, contractAddress, tokenId, listedItem.price);
    }

    function updateListing(
        address contractAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(contractAddress, tokenId)
        nonReentrant
        isOwner(contractAddress, tokenId, msg.sender)
    {
        if (newPrice == 0) {
            revert PriceMustBeAboveZero();
        }
        {
            // local scope for compilation
            address ca = contractAddress;
            uint tId = tokenId;

            s_listings[ca][tId].price = newPrice;
            emit ItemListed(
                s_listings[ca][tId].listingId,
                msg.sender,
                contractAddress,
                tokenId,
                newPrice
            );
        }
    }

    function getListing(
        address contractAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[contractAddress][tokenId];
    }

    function getListingById(
        uint256 listingId
    ) external view returns (ListedItem memory) {
        return _idToListing[listingId];
    }

    function fetchListedMarketItems()
        external
        view
        returns (ListedItem[] memory)
    {
        uint itemCount = _totalMpListings.current() - _totalComplete.current();
        ListedItem[] memory items = new ListedItem[](itemCount);
        uint currentIndex = 0;

        for (uint i = 0; i < _totalMpListings.current(); i++) {
            if (_idToListing[i].active == true) {
                ListedItem storage l = _idToListing[i];
                items[currentIndex] = l;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyListings() public view returns (ListedItem[] memory) {
        ListedItem[] memory items = new ListedItem[](
            _totalMpListings.current()
        );
        uint currentIndex = 0;

        for (uint i = 0; i < _totalMpListings.current(); i++) {
            if (_idToListing[i].listing.seller == msg.sender) {
                if (_idToListing[i].active == true) {
                    ListedItem storage l = _idToListing[i];
                    items[currentIndex] = l;
                    currentIndex += 1;
                }
            }
        }

        return items;
    }
}
