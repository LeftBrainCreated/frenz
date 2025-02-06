// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

interface IShop {
    function getListing(
        address,
        uint256
    ) external view returns (Listing memory);

    function getListingById(uint256) external view returns (ListedItem memory);

    function fetchListedMarketItems(address, uint)
        external
        view
        returns (ListedItem[] memory);

    function fetchMyListings(uint) external view returns (ListedItem[] memory);

    function getOffer(address, uint256) external view returns (Offer memory);

    function getOfferById(uint256) external view returns (BuyOffer memory);

    function fetchActiveOffers(address, uint) external view returns (BuyOffer[] memory);

    function fetchMyOffers(uint) external view returns (BuyOffer[] memory);

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

    struct Offer {
        uint price;
        address buyer;
        uint offerID;
    }
    struct BuyOffer {
        address contractAddress;
        uint tokenId;
        Offer offer;
        uint256 createTime;
        bool active;
    }
}
