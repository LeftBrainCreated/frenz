// SPDX-License-Identifier: MIT

/**
 * @title: ERC721 Contract Creator
 * @dev: leftbrain
 */

pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AdminControl} from "../deps/AdminControl.sol";
import {NFTGeneric, RoyaltyManager} from "../deps/Interfaces.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

error PriceNotMet(address contractAddress, uint256 tokenId, uint256 price);
error NotListed(address contractAddress, uint256 tokenId);
error AlreadyListed(address contractAddress, uint256 tokenId);
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

abstract contract TransactionMgr is
    Initializable,
    OwnableUpgradeable,
    AdminControl,
    ReentrancyGuardUpgradeable
{
    using Counters for Counters.Counter;

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => mapping(uint256 => Offer)) private b_offers;
    mapping(address => uint256) private s_proceeds;
    mapping(uint256 => ListedItem) private _idToListing;
    mapping(uint256 => BuyOffer) public _idToBuyOffers;
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public buyOffersEscrow;
    Counters.Counter private _totalMpListings;
    Counters.Counter private _totalBuyOffers;
    Counters.Counter private _totalComplete;
    uint internal _activeOffersCount;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    struct Listing {
        uint256 price;
        address seller;
        uint256 listingId;
    }

    struct Offer {
        uint price;
        address buyer;
        uint offerID;
    }

    struct ListedItem {
        address contractAddress;
        uint tokenId;
        Listing listing;
        bool active;
    }

    struct BuyOffer {
        address contractAddress;
        uint tokenId;
        Offer offer;
        uint256 createTime;
        bool active;
    }

    event RoyaltiesPaid(address contractAddress, uint256 tokenId, uint value);

    event ItemListed(
        uint256 listingId,
        address indexed seller,
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event NewBuyOffer(
        address contractAddress,
        uint256 tokenId,
        address buyer,
        uint256 value
    );

    event Sale(
        address contractAddress,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 value
    );

    modifier isOwner(
        address contractAddress,
        uint256 tokenId,
        address sender
    ) {
        IERC721 nft = IERC721(contractAddress);
        address owner = nft.ownerOf(tokenId);
        if (sender != owner) {
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
    {
        _idToListing[s_listings[contractAddress][tokenId].listingId]
            .active = false;
        delete (s_listings[contractAddress][tokenId]);
        _totalComplete.increment();
    }

    function listItem(
        address contractAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isOwner(contractAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        if (s_listings[contractAddress][tokenId].price > 0) {
            revert AlreadyListed(contractAddress, tokenId);
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
    )
        external
        payable
        tokenOwnerForbidden(contractAddress, tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[contractAddress][tokenId];

        if (msg.value < listedItem.price) {
            revert PriceNotMet(contractAddress, tokenId, listedItem.price);
        }

        {
            _idToListing[s_listings[contractAddress][tokenId].listingId]
                .active = false;
            delete (s_listings[contractAddress][tokenId]);
            IERC721(contractAddress).safeTransferFrom(
                listedItem.seller,
                msg.sender,
                tokenId
            );

            // clear from _userOffers
            transact(contractAddress, tokenId, msg.value, listedItem.seller);

            address existingBuyOfferOwner = b_offers[contractAddress][tokenId]
                .buyer;

            uint256 refundBuyOfferAmount = buyOffersEscrow[existingBuyOfferOwner][
                contractAddress
            ][tokenId];

            buyOffersEscrow[existingBuyOfferOwner][contractAddress][tokenId] = 0;
            _idToBuyOffers[b_offers[contractAddress][tokenId].offerID]
                .active = false;

            // Refund the current buy offer if it is non-zero
            if (refundBuyOfferAmount > 0) {
                transferFunds(existingBuyOfferOwner, refundBuyOfferAmount);
            }

            _totalComplete.increment();
        }

        emit ItemBought(msg.sender, contractAddress, tokenId, listedItem.price);
    }

    function makeBuyOffer(
        address contractAddress,
        uint256 tokenId
    ) external payable tokenOwnerForbidden(contractAddress, tokenId) {
        require(
            _idToBuyOffers[b_offers[contractAddress][tokenId].offerID]
                .createTime <
                (block.timestamp - 1 days) ||
                msg.value > b_offers[contractAddress][tokenId].price,
            "Previous buy offer higher or not expired"
        );
        address previousBuyOfferOwner = b_offers[contractAddress][tokenId]
            .buyer;
        uint256 refundBuyOfferAmount = buyOffersEscrow[previousBuyOfferOwner][
            contractAddress
        ][tokenId];

        buyOffersEscrow[previousBuyOfferOwner][contractAddress][tokenId] = 0;
        if (refundBuyOfferAmount > 0) {
            _activeOffersCount = _activeOffersCount - 1;
            transferFunds(previousBuyOfferOwner, refundBuyOfferAmount);
        }
        _idToBuyOffers[b_offers[contractAddress][tokenId].offerID]
            .active = false;

        Offer memory o = Offer(
            msg.value,
            msg.sender,
            _totalBuyOffers.current()
        );

        b_offers[contractAddress][tokenId] = o;
        BuyOffer memory bo = BuyOffer(
            contractAddress,
            tokenId,
            o,
            block.timestamp,
            true
        );
        _idToBuyOffers[_totalBuyOffers.current()] = bo;
        _totalBuyOffers.increment();
        _activeOffersCount = _activeOffersCount + 1;

        buyOffersEscrow[msg.sender][contractAddress][tokenId] = msg.value;

        emit NewBuyOffer(contractAddress, tokenId, msg.sender, msg.value);
    }

    function withdrawBuyOffer(
        address contractAddress,
        uint256 tokenId
    ) external {
        require(
            b_offers[contractAddress][tokenId].buyer == msg.sender,
            "Not buyer"
        );
        uint256 refundBuyOfferAmount = buyOffersEscrow[msg.sender][
            contractAddress
        ][tokenId];

        buyOffersEscrow[msg.sender][contractAddress][tokenId] = 0;
        _idToBuyOffers[b_offers[contractAddress][tokenId].offerID]
            .active = false;
        delete (b_offers[contractAddress][tokenId]);
        _activeOffersCount = _activeOffersCount - 1;

        if (refundBuyOfferAmount > 0) {
            transferFunds(msg.sender, refundBuyOfferAmount);
        }
    }

    /// @notice Lets a token owner accept the current buy offer
    ///         (even without a sell offer)
    /// @param tokenId - id of the token whose buy order to accept
    function acceptBuyOffer(
        address contractAddress,
        uint256 tokenId
    ) external tokenOwnerOnly(contractAddress, tokenId) {
        address currentBuyer = b_offers[contractAddress][tokenId].buyer;
        require(currentBuyer != address(0), "No buy offer");
        uint256 saleValue = b_offers[contractAddress][tokenId].price;

        _idToListing[s_listings[contractAddress][tokenId].listingId]
            .active = false;
        delete (s_listings[contractAddress][tokenId]);
        _idToBuyOffers[b_offers[contractAddress][tokenId].offerID]
            .active = false;
        delete (b_offers[contractAddress][tokenId]);

        if (_activeOffersCount > 0) {
            _activeOffersCount = _activeOffersCount - 1;
        }

        // Withdraw buyer's balance
        buyOffersEscrow[currentBuyer][contractAddress][tokenId] = 0;

        transact(contractAddress, tokenId, saleValue, msg.sender);

        IERC721(contractAddress).safeTransferFrom(
            msg.sender,
            currentBuyer,
            tokenId
        );

        // Broadcast the sale
        emit Sale(
            contractAddress,
            tokenId,
            msg.sender,
            currentBuyer,
            saleValue
        );
    }

    function updateListing(
        address contractAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
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

    function _addressRoyalties(
        address contractAddress,
        uint256 tokenId,
        uint256 grossSaleValue
    ) internal returns (uint256 netSaleAmount) {
        RoyaltyManager rc = RoyaltyManager(royaltiesContractAddress);

        (address royaltiesReceiver, uint256 royaltiesAmount) = rc.getRoyalty(
            contractAddress,
            tokenId,
            grossSaleValue
        );

        if (royaltiesAmount > 0) {
            transferFunds(royaltiesReceiver, royaltiesAmount);
        }

        emit RoyaltiesPaid(contractAddress, tokenId, royaltiesAmount);
        return royaltiesAmount;
    }

    function transact(
        address contractAddress,
        uint tokenId,
        uint saleValue,
        address sellerAddress
    ) private {
        transferFunds(_devWallet, (saleValue / 10000) * (_platformFee / 2));
        uint royalties = _addressRoyalties(contractAddress, tokenId, saleValue);

        transferFunds(
            sellerAddress,
            ((saleValue / 10000) * (10000 - _platformFee) - royalties)
        );
    }

    function transferFunds(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "transfer failed");
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

    function fetchListedMarketItems(address contractAddress, uint startingIndex)
        external
        view
        returns (ListedItem[] memory)
    {
        uint totalListings = _totalMpListings.current();

        ListedItem[] memory itemsTemp = new ListedItem[](totalListings - startingIndex); // Temporary storage
        uint currentIndex = 0;

        for (uint i = startingIndex; i < totalListings && currentIndex < 100; i++) {
            if (_idToListing[i].contractAddress == contractAddress) {
                ListedItem storage l = _idToListing[i];
                if (currentIndex < itemsTemp.length) {  // Ensure we do not go out of bounds
                    itemsTemp[currentIndex] = l;
                    currentIndex++;
                }
            }
        }

        // Now, create a new array with the exact size of valid entries found
        ListedItem[] memory items = new ListedItem[](currentIndex);
        for (uint j = 0; j < currentIndex; j++) {
            items[j] = itemsTemp[j];
        }

        return items;
    }

    function fetchMyListings(uint startingIndex) public view returns (ListedItem[] memory) {
        uint totalListings = _totalMpListings.current();
        ListedItem[] memory itemsTemp = new ListedItem[](totalListings); // Temporary array to hold all potential items
        uint currentIndex = 0;

        for (uint i = startingIndex; i < totalListings && currentIndex < 100; i++) {
            ListedItem storage item = _idToListing[i];
            if (item.listing.seller == msg.sender && item.contractAddress != address(0) && item.active) {
                itemsTemp[currentIndex] = item;
                currentIndex++;
            }
        }

        // Create a new array with the exact size of valid entries found
        ListedItem[] memory items = new ListedItem[](currentIndex);
        for (uint j = 0; j < currentIndex; j++) {
            items[j] = itemsTemp[j];
        }

        return items;
    }

    function getOffer(
        address contractAddress,
        uint256 tokenId
    ) external view returns (Offer memory) {
        return b_offers[contractAddress][tokenId];
    }

    function getOfferById(
        uint256 offerId
    ) external view returns (BuyOffer memory) {
        return _idToBuyOffers[offerId];
    }

    function fetchActiveOffers(address contractAddress, uint startingIndex) external view returns (BuyOffer[] memory) {
        uint totalOffers = _totalBuyOffers.current();

        BuyOffer[] memory itemsTemp = new BuyOffer[](totalOffers - startingIndex);
        uint currentIndex = 0;

        for (uint i = startingIndex; i < _totalBuyOffers.current() && currentIndex <= 100; i++) {
            if (_idToBuyOffers[i].contractAddress == contractAddress) {
                BuyOffer storage l = _idToBuyOffers[i];
                if (currentIndex < itemsTemp.length) {
                    itemsTemp[currentIndex] = l;
                    currentIndex++;
                }
            }
        }

        BuyOffer[] memory items = new BuyOffer[](currentIndex);
        for (uint j = 0; j < currentIndex; j++) {
            items[j] = itemsTemp[j];
        }

        return items;
    }

    function fetchMyOffers(uint startingIndex) public view returns (BuyOffer[] memory) {
        uint totalOffers = _totalBuyOffers.current();

        BuyOffer[] memory itemsTemp = new BuyOffer[](totalOffers - startingIndex);
        uint currentIndex = 0;

        for (uint i = startingIndex; i < totalOffers && currentIndex <= 100; i++) {
            BuyOffer storage item = _idToBuyOffers[i];

            if (item.offer.buyer == msg.sender && item.contractAddress != address(0)) {
                itemsTemp[currentIndex] = item;
                currentIndex++;
            }
        }

        BuyOffer[] memory items = new BuyOffer[](currentIndex);
        for (uint j = 0; j < currentIndex; j++) {
            items[j] = itemsTemp[j];
        }

        return items;
    }

    modifier tokenOwnerForbidden(address contractAddress, uint256 tokenId) {
        NFTGeneric nftContract = NFTGeneric(contractAddress);

        require(
            nftContract.ownerOf(tokenId) != msg.sender,
            "Token owner not allowed"
        );
        _;
    }

    modifier tokenOwnerOnly(address contractAddress, uint256 tokenId) {
        NFTGeneric nftContract = NFTGeneric(contractAddress);

        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier isMarketable(address contractAddress, uint256 tokenId) {
        NFTGeneric nftContract = NFTGeneric(contractAddress);

        require(
            nftContract.getApproved(tokenId) == address(this),
            "Not approved"
        );
        _;
    }

    function updateRoyaltiesContractAddress(
        address newCa
    ) external adminRequired {
        royaltiesContractAddress = newCa;
    }

    address private royaltiesContractAddress;
}
