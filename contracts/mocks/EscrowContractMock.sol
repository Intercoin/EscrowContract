// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../EscrowContract.sol";

contract EscrowContractMock is EscrowContract {
    
    function participantsLength() public view returns(uint256 ret) {
        ret = escrowBox.participants.length;
    }
    function fundsAvailable(address token) public view returns(uint256 ret) {
        uint256 indexR = escrowBox.recipientsIndex[msg.sender];
        //ret = escrowBox.recipients[indexR].fundsAvailable[token];
        ret = recipientsFundsAvailable[indexR][token];
        
    }
    
    
}


