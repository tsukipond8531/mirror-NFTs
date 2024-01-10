pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MirrorERC721 is ERC721URIStorage {
    event SessionEnded(address ownerOf, uint256 tokenId);

    mapping(uint256 => address) public _owners;

    string baseURI;

    constructor() ERC721("MirrorERC721", "MFT") {}

    function setBaseURI(string memory newBaseURI) external {
        baseURI = newBaseURI;
    }

    function getBaseURI() public view returns (string memory) {
        return _baseURI();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) external {
        _setTokenURI(tokenId, tokenURI);
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        _owners[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) public view override(ERC721, IERC721) returns (address) {
        return _owners[tokenId];
    }

    function burn(uint256 tokenId) external {
        require(_owners[tokenId] == msg.sender, "Only owner can burn");
        _burn(tokenId);
        delete _owners[tokenId];
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        require(_owners[tokenId] == from, "Only owner can transfer");
        super.transferFrom(from, to, tokenId);
        _owners[tokenId] = to;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) {
        require(_owners[tokenId] == from, "Only owner can transfer");
        super.safeTransferFrom(from, to, tokenId, data);
        _owners[tokenId] = to;
    }

    function endSession(uint256 tokenId) external {
        require(_owners[tokenId] == msg.sender, "Only owner can end session");
        emit SessionEnded(msg.sender, tokenId);
    }
}