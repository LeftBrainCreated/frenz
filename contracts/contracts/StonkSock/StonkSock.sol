// Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

contract StonkSock is ERC721Enumerable, Ownable, ERC721Pausable, ERC721URIStorage {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIds;
    bool private presaleLive;
    bool private saleLive;

    uint256 public constant MINT_LIMIT = 2022;
    uint256 public constant PRESAL_LIMIT = 500;
    uint256 public constant PRICE = 0.0001 ether;
    uint256 public constant PRESALE_PRICE = 0.03 ether;
    uint256 public constant MAX_PER_WALLET = 20;
    uint256 public constant MAX_MINT_PRESALE = 5;
    address public constant devAddress = 0x28CC536e3C340c4D3a9BA751a3FB970D1867F4a4;

    string public baseTokenURI;

    mapping(address => bool) private _presaleList;
    mapping(address => uint256) private _presaleListClaimed;

    event CreateNft(uint256 indexed id);

    constructor() ERC721("StonkSock", "SOCK") {
        setBaseURI("ipfs://");
        presaleLive = false;
        saleLive = false;
    }

    function setPresaleAddress(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Invalid Wallet Address");

            _presaleList[addresses[i]] = true;
            _presaleListClaimed[addresses[i]] > 0 ? _presaleListClaimed[addresses[i]] : 0;
        }
    }

    function invalidatePresale(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Invalid Wallet Address");

            _presaleList[addresses[i]] = false;
        }
    }

    modifier presaleIsLive {
        require(_totalSupply() < MINT_LIMIT, "Presale ended");

        if (_msgSender() != owner()) {
            require(presaleLive == true, "Presale Not Live");
        }

        _;
    }

    modifier saleIsLive {
        require(_totalSupply() < MINT_LIMIT, "Sale ended");

        if (_msgSender() != owner()) {
            require(saleLive == true, "Sale Not Live");
        }

        _;
    }

    function _totalSupply() internal view returns (uint) {
        return _tokenIds.current();
    }

    function totalMint() public view returns (uint256) {
        return _totalSupply();
    }

    function mintReserve(address _to, uint256 startId, string[] memory URIs) public onlyOwner {
        uint _count = URIs.length;

        require(_totalSupply() + _count < MINT_LIMIT, "Max limit");

        for (uint256 i = 0; i < _count; i++) {
            require(_totalSupply() + 1 == (startId + i), "Invalid ID");

            _mintAnElement(_to, URIs[i]);
        }
    }

    function presaleMint(address _to, uint256 startId, string[] memory URIs) public payable presaleIsLive returns (uint256[] memory ids)  {
        uint _count = URIs.length;

        require(presaleLive == true, "Sale is not Active");
        require(_presaleList[_to], 'Address Not Whitelisted for Presale');
        require(balanceOf(_to) + _count <= MAX_MINT_PRESALE, 'Max 5 Presale');
        require(_totalSupply() + _count < PRESAL_LIMIT, "Presale Max Limit");
        require(msg.value >= price(_count), "Insufficient Funds For Mint");

        for (uint256 i = 0; i < _count; i++) {
            require(_totalSupply() + 1 == (startId + i), "Invalid ID");

            _presaleListClaimed[_to] += 1;

            _mintAnElement(_to, URIs[i]);
        }

        return ids;
    }

    function mint(address _to, uint startId, string[] memory URIs) public payable saleIsLive returns (uint256[] memory ids) {
        uint _count = URIs.length;

        require(_totalSupply() + _count < MINT_LIMIT, "Not enough Tokens remaining for this Request");
        require(_count + balanceOf(_to) <= MAX_PER_WALLET, "Exceeds Max Number");
        require(msg.value >= price(_count), "Insufficient Funds For Mint");

        for (uint256 i = 0; i < _count; i++) {
            require(_totalSupply() + 1 == startId + i, "Invalid ID");

            _mintAnElement(_to, URIs[i]);
        }

        return ids;
    }

    function _mintAnElement(address _to, string memory metadataURI) private returns (uint256) {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(_to, id);
        _setTokenURI(id, metadataURI);

        uint returnValue = id;
        
        emit CreateNft(id);
        return returnValue;
    }

    function price(uint256 _count) public view returns (uint256) {
        if (presaleLive) {
            if (saleLive == false) {
            return PRESALE_PRICE.mul(_count);
            }
        } 

        return PRICE.mul(_count);
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://QmaBynsnNYMsPRM1U1XEavw6CUfrGgYJrhcF4UnKcX7QFg";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function togglePresale() public onlyOwner {
        presaleLive = !presaleLive;
    }

    function toggleSale() public onlyOwner {
        saleLive = !saleLive;
        presaleLive = false;
    }

    function withdrawAll() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        _widthdraw(devAddress, address(this).balance);
    }

    function _widthdraw(address _address, uint256 _amount) private {
        (bool success,) = _address.call{value : _amount}("");
        require(success, "Transfer failed.");
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint tokenId) internal virtual override (ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}