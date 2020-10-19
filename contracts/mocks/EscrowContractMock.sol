pragma solidity >=0.6.0 <0.7.0;

import "../EscrowContract.sol";

contract EscrowContractMock is EscrowContract {
    
     /**
     * Started Escrow mechanism
     * 
     * @param participants array of participants (one of complex arrays participants/tokens/minimums)
     * @param tokens array of tokens (one of complex arrays participants/tokens/minimums)
     * @param minimums array of minimums (one of complex arrays participants/tokens/minimums)
     * @param duration duration of escrow in seconds. will start since locked up to expire
     * @param quorumCount count of participants (which deposit own minimum). After last will initiate locked up
     * @param swapFrom array of participants which resources swap from
     * @param swapTo array of participants which resources swap to
     * @param swapBackAfterEscrow if true, then: if withdraw is called after lock expired, and boxes still contain something, then SWAP BACK (swapTo->swapFrom) left resources
     */
    constructor (
        address[] memory participants,
        address[] memory tokens,
        uint256[] memory minimums,
        uint256 duration,
        uint256 quorumCount,
        address[] memory swapFrom,
        address[] memory swapTo,
        bool swapBackAfterEscrow
    ) 
        EscrowContract (participants, tokens, minimums, duration, quorumCount, swapFrom, swapTo, swapBackAfterEscrow) 
        public 
    {
        
    }
    
    function participantsLength() public view returns(uint256 ret) {
        ret = escrowBox.participants.length;
    }
    function fundsAvailable(address token) public view returns(uint256 ret) {
        uint256 indexR = escrowBox.recipientsIndex[_msgSender()];
        ret = escrowBox.recipients[indexR].fundsAvailable[token];
        
    }
    
    
}


