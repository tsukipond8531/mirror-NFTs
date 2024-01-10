// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MockERC721 is ERC721URIStorage {

    mapping(uint256 => address) public _owners;
    mapping(uint256 => bool) public _locked;

    string baseURI;

    constructor() ERC721("MockERC721", "MFT") {}

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
        _locked[tokenId] = false;
    }

    function ownerOf(uint256 tokenId) public view override(ERC721, IERC721) returns (address) {
        return _owners[tokenId];
    }

    function isLocked(uint256 tokenId) public view returns (bool) {
        return _locked[tokenId];
    }

    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public override(ERC721, IERC721) {
    //     require(!_locked[tokenId], "Token is locked");
    //     super.transferFrom(from, to, tokenId);
    // }

    // function safeTransferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public override(ERC721, IERC721) {
    //     require(!_locked[tokenId], "Token is locked");
    //     super.safeTransferFrom(from, to, tokenId);
    // }

    // function safeTransferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     bytes memory data
    // ) public override(ERC721, IERC721) {
    //     require(!_locked[tokenId], "Token is locked");
    //     super.safeTransferFrom(from, to, tokenId, data);
    // }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
        delete _owners[tokenId];
        delete _locked[tokenId];
    }

    function lockToken(uint256 tokenId) external {
        _locked[tokenId] = true;
    }

    function unlockToken(uint256 tokenId) external {
        _locked[tokenId] = false;
    }
}