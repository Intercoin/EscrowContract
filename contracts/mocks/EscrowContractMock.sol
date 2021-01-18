pragma solidity >=0.6.0 <0.7.0;

import "../EscrowContract.sol";

contract EscrowContractMock is EscrowContract {
    
    function participantsLength() public view returns(uint256 ret) {
        ret = escrowBox.participants.length;
    }
    function fundsAvailable(address token) public view returns(uint256 ret) {
        uint256 indexR = escrowBox.recipientsIndex[_msgSender()];
        ret = escrowBox.recipients[indexR].fundsAvailable[token];
        
    }
    
    
}


