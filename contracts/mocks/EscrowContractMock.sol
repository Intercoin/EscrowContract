pragma solidity >=0.6.0 <0.7.0;

import "../EscrowContract.sol";

contract EscrowContractMock is EscrowContract {
    
    function participantsLength(uint256 escrowID) public view returns(uint256 ret) {
        ret = escrowBoxes[escrowID].participants.length;
    }
    function fundsAvailable(uint256 escrowID, address token) public view returns(uint256 ret) {
        uint256 indexR = escrowBoxes[escrowID].recipientsIndex[_msgSender()];
        ret = escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token];
        
    }
    
    
}


