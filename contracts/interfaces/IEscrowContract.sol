// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@artman325/whitelist/contracts/interfaces/IWhitelist.sol";

interface IEscrowContract {

    
    struct Trade {
        address from;
        address to;
        bool offchain;
        bool disputed;
        bool arbitrated;
        address token;
        uint256 amount;
    }

    /**
     * Started Escrow mechanism
     * @param duration duration of escrow in seconds. will start since locked up to expire
     * @param trades an array of trades to occur when the escrow.lock occurs
     * @param judges whitelist data struct
     *  address contractAddress;
	 *	bytes4 method;
	 *	uint8 role;
     *  bool useWhitelist;
     */
    function init(
        uint256 duration,
        Trade[] memory trades,
        IWhitelist.WhitelistStruct memory judges,
        address costManager,
        address producedBy

    ) external;
       
}