// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract NFT is ERC721PresetMinterPauserAutoId {
  constructor(
    string memory name,
    string memory symbol,
    string memory baseTokenURI
  ) ERC721PresetMinterPauserAutoId(name, symbol, baseTokenURI) {}
}
