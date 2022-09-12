// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IEscrowContract.sol";
import "./EscrowContract.sol";

contract EscrowFactory {
    using Clones for address;

    /**
    * @custom:shortd Escrow implementation address
    * @notice Escrow implementation address
    */
    EscrowContract public immutable implementation;

    address[] public instances;
    
    event InstanceCreated(address instance, uint instancesCount);

    /**
    */
    constructor() {
        implementation      = new EscrowContract();
        
    }

    ////////////////////////////////////////////////////////////////////////
    // external section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
    * @dev view amount of created instances
    * @return amount amount instances
    * @custom:shortd view amount of created instances
    */
    function instancesCount()
        external 
        view 
        returns (uint256 amount) 
    {
        amount = instances.length;
    }

    ////////////////////////////////////////////////////////////////////////
    // public section //////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
    * @param participants array of participants (one of complex arrays participants/tokens/minimums)
    * @param tokens array of tokens (one of complex arrays participants/tokens/minimums)
    * @param minimums array of minimums (one of complex arrays participants/tokens/minimums)
    * @param duration duration of escrow in seconds. will start since locked up to expire
    * @param quorumCount count of participants (which deposit own minimum). After last will initiate locked up
    * @param swapFrom array of participants which resources swap from
    * @param swapTo array of participants which resources swap to
    * @param swapBackAfterEscrow if true, then: if withdraw is called after lock expired, and boxes still contain something, then SWAP BACK (swapTo->swapFrom) left resources
    * @return instance address of created instance `EscrowContract`
    * @custom:shortd creation EscrowContract instance
    */
    function produce(
        address[] memory participants,
        address[] memory tokens,
        uint256[] memory minimums,
        uint256 duration,
        uint256 quorumCount,
        address[] memory swapFrom,
        address[] memory swapTo,
        bool swapBackAfterEscrow
    ) 
        public 
        returns (address instance) 
    {
        
        instance = address(implementation).clone();

        _produce(instance);

        IEscrowContract(instance).init(
            participants,
            tokens,
            minimums,
            duration,
            quorumCount,
            swapFrom,
            swapTo,
            swapBackAfterEscrow
        );
        
        _postProduce(instance);
        
    }

    ////////////////////////////////////////////////////////////////////////
    // internal section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    function _produce(
        address instance
    ) 
        internal
    {
        require(instance != address(0), "CommunityCoinFactory: INSTANCE_CREATION_FAILED");

        instances.push(instance);
        
        emit InstanceCreated(instance, instances.length);
    }

     function _postProduce(
        address instance
    ) 
        internal
    {
        // used for transferownership
    }
}