// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IResults {
 
  function setResults(address recipient, string URI, string hash) external;
       
}
