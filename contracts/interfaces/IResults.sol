// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IResults {
 
  function setResults(address recipient, address sender, string calldata URI, string calldata hash) external;
       
}
