// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../contracts/interfaces/IEscrowContract.sol";
import "../contracts/interfaces/IResults.sol";
import "@artman325/releasemanager/contracts/CostManagerHelper.sol";
import "@artman325/whitelist/contracts/Whitelist.sol";

/**
*****************
TEMPLATE CONTRACT
*****************

Although this code is available for viewing on GitHub and here, the general public is NOT given a license to freely deploy smart contracts based on this code, on any blockchains.

To prevent confusion and increase trust in the audited code bases of smart contracts we produce, we intend for there to be only ONE official Factory address on the blockchain producing the corresponding smart contracts, and we are going to point a blockchain domain name at it.

Copyright (c) Intercoin Inc. All rights reserved.

ALLOWED USAGE.

Provided they agree to all the conditions of this Agreement listed below, anyone is welcome to interact with the official Factory Contract at the this address to produce smart contract instances, or to interact with instances produced in this manner by others.

Any user of software powered by this code MUST agree to the following, in order to use it. If you do not agree, refrain from using the software:

DISCLAIMERS AND DISCLOSURES.

Customer expressly recognizes that nearly any software may contain unforeseen bugs or other defects, due to the nature of software development. Moreover, because of the immutable nature of smart contracts, any such defects will persist in the software once it is deployed onto the blockchain. Customer therefore expressly acknowledges that any responsibility to obtain outside audits and analysis of any software produced by Developer rests solely with Customer.

Customer understands and acknowledges that the Software is being delivered as-is, and may contain potential defects. While Developer and its staff and partners have exercised care and best efforts in an attempt to produce solid, working software products, Developer EXPRESSLY DISCLAIMS MAKING ANY GUARANTEES, REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED, ABOUT THE FITNESS OF THE SOFTWARE, INCLUDING LACK OF DEFECTS, MERCHANTABILITY OR SUITABILITY FOR A PARTICULAR PURPOSE.

Customer agrees that neither Developer nor any other party has made any representations or warranties, nor has the Customer relied on any representations or warranties, express or implied, including any implied warranty of merchantability or fitness for any particular purpose with respect to the Software. Customer acknowledges that no affirmation of fact or statement (whether written or oral) made by Developer, its representatives, or any other party outside of this Agreement with respect to the Software shall be deemed to create any express or implied warranty on the part of Developer or its representatives.

INDEMNIFICATION.

Customer agrees to indemnify, defend and hold Developer and its officers, directors, employees, agents and contractors harmless from any loss, cost, expense (including attorney’s fees and expenses), associated with or related to any demand, claim, liability, damages or cause of action of any kind or character (collectively referred to as “claim”), in any manner arising out of or relating to any third party demand, dispute, mediation, arbitration, litigation, or any violation or breach of any provision of this Agreement by Customer.

NO WARRANTY.

THE SOFTWARE IS PROVIDED “AS IS” WITHOUT WARRANTY. DEVELOPER SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES FOR BREACH OF THE LIMITED WARRANTY. TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVELOPER EXPRESSLY DISCLAIMS, AND CUSTOMER EXPRESSLY WAIVES, ALL OTHER WARRANTIES, WHETHER EXPRESSED, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR USE, OR ANY WARRANTY ARISING OUT OF ANY PROPOSAL, SPECIFICATION, OR SAMPLE, AS WELL AS ANY WARRANTIES THAT THE SOFTWARE (OR ANY ELEMENTS THEREOF) WILL ACHIEVE A PARTICULAR RESULT, OR WILL BE UNINTERRUPTED OR ERROR-FREE. THE TERM OF ANY IMPLIED WARRANTIES THAT CANNOT BE DISCLAIMED UNDER APPLICABLE LAW SHALL BE LIMITED TO THE DURATION OF THE FOREGOING EXPRESS WARRANTY PERIOD. SOME STATES DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES AND/OR DO NOT ALLOW LIMITATIONS ON THE AMOUNT OF TIME AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO CUSTOMER. THIS LIMITED WARRANTY GIVES CUSTOMER SPECIFIC LEGAL RIGHTS. CUSTOMER MAY HAVE OTHER RIGHTS WHICH VARY FROM STATE TO STATE. 

LIMITATION OF LIABILITY. 

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DEVELOPER BE LIABLE UNDER ANY THEORY OF LIABILITY FOR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE OR EXEMPLARY DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, DAMAGES ARISING FROM LOSS OF PROFITS, REVENUE, DATA OR USE, OR FROM INTERRUPTED COMMUNICATIONS OR DAMAGED DATA, OR FROM ANY DEFECT OR ERROR OR IN CONNECTION WITH CUSTOMER'S ACQUISITION OF SUBSTITUTE GOODS OR SERVICES OR MALFUNCTION OF THE SOFTWARE, OR ANY SUCH DAMAGES ARISING FROM BREACH OF CONTRACT OR WARRANTY OR FROM NEGLIGENCE OR STRICT LIABILITY, EVEN IF DEVELOPER OR ANY OTHER PERSON HAS BEEN ADVISED OR SHOULD KNOW OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF ANY REMEDY TO ACHIEVE ITS INTENDED PURPOSE. WITHOUT LIMITING THE FOREGOING OR ANY OTHER LIMITATION OF LIABILITY HEREIN, REGARDLESS OF THE FORM OF ACTION, WHETHER FOR BREACH OF CONTRACT, WARRANTY, NEGLIGENCE, STRICT LIABILITY IN TORT OR OTHERWISE, CUSTOMER'S EXCLUSIVE REMEDY AND THE TOTAL LIABILITY OF DEVELOPER OR ANY SUPPLIER OF SERVICES TO DEVELOPER FOR ANY CLAIMS ARISING IN ANY WAY IN CONNECTION WITH OR RELATED TO THIS AGREEMENT, THE SOFTWARE, FOR ANY CAUSE WHATSOEVER, SHALL NOT EXCEED 1,000 USD.

TRADEMARKS.

This Agreement does not grant you any right in any trademark or logo of Developer or its affiliates.

LINK REQUIREMENTS.

Operators of any Websites and Apps which make use of smart contracts based on this code must conspicuously include the following phrase in their website, featuring a clickable link that takes users to intercoin.app:

"Visit https://intercoin.app to launch your own NFTs, DAOs and other Web3 solutions."

STAKING OR SPENDING REQUIREMENTS.

In the future, Developer may begin requiring staking or spending of Intercoin tokens in order to take further actions (such as producing series and minting tokens). Any staking or spending requirements will first be announced on Developer's website (intercoin.org) four weeks in advance. Staking requirements will not apply to any actions already taken before they are put in place.

CUSTOM ARRANGEMENTS.

Reach out to us at intercoin.org if you are looking to obtain Intercoin tokens in bulk, remove link requirements forever, remove staking requirements forever, or get custom work done with your Web3 projects.

ENTIRE AGREEMENT

This Agreement contains the entire agreement and understanding among the parties hereto with respect to the subject matter hereof, and supersedes all prior and contemporaneous agreements, understandings, inducements and conditions, express or implied, oral or written, of any nature whatsoever with respect to the subject matter hereof. The express terms hereof control and supersede any course of performance and/or usage of the trade inconsistent with any of the terms hereof. Provisions from previous Agreements executed between Customer and Developer., which are not expressly dealt with in this Agreement, will remain in effect.

SUCCESSORS AND ASSIGNS

This Agreement shall continue to apply to any successors or assigns of either party, or any corporation or other entity acquiring all or substantially all the assets and business of either party whether by operation of law or otherwise.

ARBITRATION

All disputes related to this agreement shall be governed by and interpreted in accordance with the laws of New York, without regard to principles of conflict of laws. The parties to this agreement will submit all disputes arising under this agreement to arbitration in New York City, New York before a single arbitrator of the American Arbitration Association (“AAA”). The arbitrator shall be selected by application of the rules of the AAA, or by mutual agreement of the parties, except that such arbitrator shall be an attorney admitted to practice law New York. No party to this agreement will challenge the jurisdiction or venue provisions as provided in this section. No party to this agreement will challenge the jurisdiction or venue provisions as provided in this section.
**/
contract EscrowContract is Initializable, /*OwnableUpgradeable,*/ ReentrancyGuardUpgradeable, IEscrowContract, CostManagerHelper, Whitelist {
    
    using AddressUpgradeable for address;
    using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToAddressMap;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    
    struct Participant {
        mapping(address => uint256) expected;
        mapping(address => uint256) balances;
        mapping(address => uint256) unlocked;
        uint256 min;
        bool exists;
    }
    struct Escrow {
        Trade[] trades;
        mapping (address => Participant) participants;
        uint256 expectedDepositCount;
        uint256 duration;
        uint256 lockedTime;
    }
    struct Trade {
        address from;
        address to;
        bool offchain;
        bool disputed;
        bool arbitrated;
        address token;
        uint256 amount;
    }
    uint8 internal constant OPERATION_SHIFT_BITS = 240;  // 256 - 16
    // Constants representing operations
    uint8 internal constant OPERATION_INITIALIZE = 0x0;
    uint8 internal constant OPERATION_DEPOSIT = 0x1;
    uint8 internal constant OPERATION_UNLOCK = 0x2;
    uint8 internal constant OPERATION_UNLOCKALL = 0x3;
    uint8 internal constant OPERATION_WITHDRAW = 0x4;
    
    address factory;
    address producedBy;

    // if one box
    //  recipientsIndex->address(token) => amount
    mapping(address => mapping(address => uint256)) available;
    mapping(address => mapping(address => mapping(address => uint256))) unlocked;
    
    WhitelistStruct arbitrators; // addresses that can call arbitrate()
   
    Escrow public escrow;
    
    event EscrowCreated(address indexed addr);
    event EscrowStarted(address indexed participant);
    event EscrowLocked();
    event EscrowArbitrated();
    event EscrowTradeInit();
    event EscrowTradeLocked();
    event EscrowTradeExecuted();
    //event EscrowEnded();

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 constant SALT = 0x111111a6b4ccb1b6faa2625fe562bdd9a23211111;
    string internal constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    bytes32 internal constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
    string internal constant EIP712_PERMIT = "Permit(address sender,address recipient,address token,uint256 total,uint256 deadline)";
    bytes32 internal constant EIP712_PERMIT_TYPEHASH = keccak256();
    struct Permit {
        uint256 index;
        uint256 total;
        uint256 deadline;
    }

    mapping(address => uint) public nonces;

    error InvalidSignature();
    
    /**
     * Started Escrow mechanism
     * 
     * @param duration duration of escrow in seconds. will start since locked up to expire
     * @param trades an array of trades to occur when the escrow.lock occurs
     * @param arbitrators whitelist data struct
     *  address contractAddress;
	 *	bytes4 method;
	 *	uint8 role;
     *  bool useWhitelist;
     * @param costManager costManager address
     * @param producedBy address which asked factory to produce this instance
     */
    function init(
        uint256 duration,
        Trade[] memory trades,
        WhitelistStruct memory arbitrators,
        address costManager,
        address producedBy
    ) 
        public 
        override
        initializer 
    {
        __CostManagerHelper_init(msg.sender);
        _setCostManager(costManager);
        //__Ownable_init();
        __ReentrancyGuard_init();

        uint chainId = block.chainid;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes('EscrowContract')),
                keccak256(bytes('1')),
                block.chainid,
                address(this),
                SALT
            )
        );
        
        emit EscrowCreated(msg.sender);
        
        require(trades.length > 0, "TRADES_LIST_EMPTY");
        
        factory = msg.sender;
	    producedBy = producedBy;
        escrow.lockedTime = 0;
        escrow.duration = duration;

        // CHEATING WARNING:
        // One side may trick the other into depositing and 
        // locking their tokens for some duration,
        // while they themselves don't do the same.
        // No one should deposit into an escrow with
        // a long duration without an arbitrator to help
        // withdraw it back.
        whitelistInit(arbitrators);
        
	    uint256 i;
        for (i = 0; i < trades.length; ++i) {
            Trade trade = trades[i];
            escrow.trades.push(trade);
	        // require(!trades[i].from.isContract(), "SEND_FROM_CANT_BE_CONTRACT");
            // require(!trades[i].to.isContract(), "SEND_TO_CANT_BE_CONTRACT");
            if (trade.amount > 0
            && escrow.participants[trade.from].expected[trade.token] == 0) {
                ++escrow.expectedDepositCount;
            }
            escrow.participants[trade.from].expected[trade.token] += trade.amount;
            emit EscrowTradeInit(trade);
        }
        
        _accountForOperation(
            OPERATION_INITIALIZE << OPERATION_SHIFT_BITS,
            uint256(uint160(producedBy)),
            0
        );
    }
    
    /**
     * @dev Deposit token via approve the tokens on the exchange
     * @param token token's address 
     */
    function deposit(address token, uint256 amount) nonReentrant() external {
        _deposit(msg.sender, token, amount, false);
    }

    /**
     * Can only be called by sender or recipient in a trade.
     * Marks trade as disputed, so arbitrator can settle the dispute.
     * @param index the index of the trade in the trades array
     * @param refundAmount the amount to return to the from address
     * @param unlockAmount the amount to unlock for the to address
     */
    function dispute(uint256 index, uint256 refundAmount, uint256 unlockAmount) external {
        Trade trade = escrow.trades[index];
        require(msg.sender == trade.from || msg.sender || trade.to, "TRADER_ONLY");
        trade.disputed = true;
    }
    
    /**
     * Can only be called by arbitrators in a dispute.
     * Can be used to refund some funds in a Trade back to sender,
     * and/or unlock some to the recipient.
     * @param index the index of the trade in the trades array
     * @param refundAmount the amount to return to the from address
     * @param unlockAmount the amount to unlock for the to address
     */
    function arbitrate(uint256 index, uint256 refundAmount, uint256 unlockAmount) external {
        Trade trade = escrow.trades[index];
        require (whitelisted(msg.sender), "ARBITRATORS_ONLY");
        require(trade.disputed, "TRADE_NOT_DISPUTED");
        require(!trade.arbitrated, "ALREADY_ARBITRATED");
        require(
            refundAmount + unlockAmount <= 
            escrow.participants[trade.from].balances[trade.token] - 
            escrow.participants[trade.from].unlocked[trade.token],
            "ARBITRATE_EXCEEDS_REMAINING_AMOUNT"
        );
        // do unlock
        _unlock(trade, unlockAmount);
        // do refund
        bool success = IERC20Upgradeable(trade.token).transfer(
            trade.from, refundAmount
        );
        require(success, "TRANSFER_FAILED");
        trade.arbitrated = true;
        emit EscrowArbitrated(trade.from, trade.to, refundAmount, unlockAmount);

        // TODO: either sender or recipient should endorse the arbitrator's decision
        // before it takes effect
    }
    
    /**
     * Unlock tokens (deposited earlier) for recipients
     * 
     * @param index index the index of the trades in trades array
     * @param amount additional amount to unlock
     */
    function unlock(uint256 index, uint256 amount) external {
        Trade trade = escrow.trades[index];
        require (trade.from == msg.sender, "NOT_AUTHORIZED");
    	_unlock(trade, amount);
    }

   /**
     * Unlock some amount, to bring total unlocked amount to permit.total .
     * The participants can exchange signed permits in a side channel, with
     * monotonically increasing totals, and eventually post them
     * to deposit and unlock the funds on each other's respective chains.
     * Each participant can stop sending permits with greater totals,
     * if they see a withdrawal pending, or for any other reason,
     * so participants typically exchange permits peer-to-peer in small
     * (0.1%) increments.
     * 
     * @param permit specifies the sender, recipient, token address and total amount to unlock
     */
    function unlockWithPermit(Permit memory permit, uint8 v, bytes32 r, bytes32 s) external {
        require(permit.deadline >= block.timestamp, 'EscrowContract: AUTHORIZATION_EXPIRED');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(EIP712_PERMIT_TYPEHASH, 
                    permit.index, 
                    permit.total, 
                    permit.deadline
                ))
            )
        );
        address recoveredAddress = ecrecover(hashPermit(permit), v, r, s);
        if(recoveredAddress == address(0) || recoveredAddress != permit.sender) {
            revert InvalidSignature();
        }
    	_unlock(
            permit.index,
            permit.total - unlocked[permit.recipient][permit.sender][permit.token]
        );
    }
    
    function hashPermit(Permit memory permit) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\\x19\\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(
                EIP712_PERMIT_TYPEHASH,
                permit.sender,
                permit.recipient,
                permit.token,
                permit.total,
                permit.deadline
            ))
        ));
    }

    /**
     * Use this to leave ratings and reviews after paying a recipient.
     * @param index the index of the trade in the trades array
     * @param URI the URI at which they would be hosted
     * @param hash the hash of the content at that URI, might be empty
     */
    function setResults(uint256 index, string URI, string hash) external {
        require(escrow.lockedTime > 0, "ESCROW_NOT_LOCKED");
        require(bytes(URI).length > 0, "EMPTY_URI");
        Trade trade = escrow.trades[index];
        require(trade.from == msg.sender, "DIDNT_PAY");
        require(
            unlocked[trade.to][trade.from][trade.token] >=
            trade.amount / 2,
            "DIDNT_PAY_ENOUGH"
        );
	    require(unlocked[trade.to][trade.from][trade.token] >= 
            trade.amount / 2, 
            "DIDNT_PAY_ENOUGH"
        );
        IResults(factory).setResults(recipient, msg.sender, URI, hash);
    }
    
    /**
     * Before lock, used to withdraw any deposited tokens.
     * After lock, used to withdraw any tokens deposited and unlocked for msg.sender by other participants.
     * Also, if escrow expired, sender can withdraw deposited tokens which were not unlocked yet
     * @param tokens addresses of the tokens to withdraw the full balance of
     */
    function withdraw(address[] memory tokens) public nonReentrant() {
        
        // before locked up
        //// got own
        // in locked period
        //// got unlocked by other participants
        // after locked up expired
        //// got own left  
        uint256 amount;
        address token;
        bool success;
	    bool canTakeBack = (
            escrow.lockedTime > 0 && 
            escrow.lockedTime + escrow.duration <= block.timestamp
        );
        if (escrow.lockedTime == 0 || canTakeBack) {
            for (uint256 i=0; i<tokens.length; ++i) {
                address token = tokens[i];
                if (escrow.participants[msg.sender].balances[token]) {
                    continue;
                }
                amount = escrow.participants[msg.sender].balances[token]
                    - (canTakeBack ? escrow.participants[msg.sender].unlocked[token] : 0);
                escrow.participants[msg.sender].balances[token] = 0;
                success = IERC20Upgradeable(token).transfer(msg.sender, amount);
                require(success, "TRANSFER_FAILED");
            }
        } else {
            for (uint256 i = 0; i < escrow.trades.length; i++) {
                if (escrow.trades[i].from != msg.sender)  {
                    continue;
                }
                token = escrow.trades[i].token;
                amount = available[escrow.trades[i].to][token];
                if (amount > 0) {
                    available[escrow.trades[i].to][token] = 0;
                    
                    success = IERC20Upgradeable(token).transfer(msg.sender, amount);
                    require(success, "TRANSFER_FAILED");
                }
            }
        }
    
        _accountForOperation(
            OPERATION_WITHDRAW << OPERATION_SHIFT_BITS,
            uint256(uint160(msg.sender)),
            0
        );
    }
    
    ////////////////////////////////////////////////////////////////////////
    // internal section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    
    /**
     * Triggered after each deposit. Once all users deposit, it will lock.
     */
    function _lockAllOnChain() internal returns (bool)  {
        require(escrow.lockedTime == 0, "ESCROW_ALREADY_LOCKED");
	
        for (uint256 i = 0; i < escrow.trades.length; i++) {
            Trade trade = escrow.trades[i];
            if (escrow.participants[trade.from].balances[trade.token]
              < escrow.participants[trade.from].expected[trade.token]) {
                 return false; // not yet ready to lock
	        }
        }
        
        escrow.lockedTime = block.timestamp;
        emit EscrowLocked(escrow.trades);
	
        // Execute all trades except offchain ones
        address sender;
        address recipient;
        address token;
        for (uint256 i = 0; i < escrow.trades.length; i++) {
            if (escrow.trades[i].offchain)  {
                continue; // user will gradually unlock as things happen offchain
            }
            Trade trade = escrow.trades[i];
            // require(
            //     escrow.participants[trade.from].balances[trade.token] 
            //     >= escrow.participants[trade.from].unlocked[trade.token] + trade.amount,
            //	   "TRADE_AMOUNT_EXCEEDS_BALANCE"
            //	);
            escrow.participants[trade.from].unlocked[trade.token] += trade.amount;
            available[trade.to][trade.token] += trade.amount;
            emit EscrowTradeExecuted(trade);
        }
        
        return true;

    }

    function _deposit(address sender, address token, uint256 amount, bool withPermit) nonReentrant() internal {
        require(escrow.lockedTime == 0, "ESCROW_ALREADY_LOCKED");
        require(escrow.participants[sender].token == token, "WRONG_TOKEN");

        uint256 _allowedAmount = IERC20Upgradeable(token).allowance(sender, address(this));
        require((_allowedAmount > amount), "ALLOWANCE_EXCEEDED");

        // try to transfer it
        bool success = IERC20Upgradeable(token).transferFrom(sender, address(this), amount);
        require(success, "TRANSFER_FAILED"); 

        escrow.participants[sender].balances[token] += amount;

        _accountForOperation(
            OPERATION_DEPOSIT << OPERATION_SHIFT_BITS,
            uint256(uint160(token)),
            uint256(uint160(msg.sender))
        );

        bool enoughBefore = (
            escrow.participants[sender].balances[token] - amount
            >= escrow.participants[sender].expected[token]
        );
        bool enoughAfter = (
            escrow.participants[sender].balances[token]
            >= escrow.participants[sender].expected[token]
        );
        if (!enoughBefore && enoughAfter) {
            --escrow.expectedDepositCount;
            if (escrow.expectedDepositCount == 0) {
                _lockAllOnChain();
            }
        }
    }
    
    function _unlock(Trade trade, uint256 amount) internal {
        require(escrow.lockedTime > 0, "ESCROW_NOT_LOCKED");
        bool tradeExists = false;
        
        // check Available amount tokens at sender (and unlockedBalance not more than available)
        require(
            escrow.participants[trade.from].balances[trade.token] >=
            escrow.participants[trade.from].unlocked[trade.token] + amount, 
            "BALANCE_EXCEEDED"
        );
        
        // write additional unlocked[token] at sender
        escrow.participants[trade.from].unlocked[trade.token] += amount;
        
        // update information for recipient
        available[trade.to][trade.token] += amount;
	    unlocked[trade.to][trade.from][trade.token] += amount;
        
        _accountForOperation(
            OPERATION_UNLOCK << OPERATION_SHIFT_BITS,
            uint256(index),
            uint256(uint160(trade.from))
        );
    }
  
    
}
