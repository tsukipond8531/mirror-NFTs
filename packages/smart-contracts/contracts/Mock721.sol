// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    mapping(uint256 => address) public _owners;

    constructor() ERC721("MockERC721", "MFT") {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        _owners[tokenId] = to;
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        return _owners[tokenId];
    }
}