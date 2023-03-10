// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableMapUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./interfaces/IEscrowContract.sol";
import "./interfaces/IResults.sol";
import "@artman325/releasemanager/contracts/CostManagerHelper.sol";
import "@artman325/whitelist/contracts/interfaces/IWhitelist.sol"

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
contract EscrowContract is Initializable, /*OwnableUpgradeable,*/ ReentrancyGuardUpgradeable, IEscrowContract, CostManagerHelper {
    
    using AddressUpgradeable for address;
    using EnumerableMapUpgradeable for EnumerableMapUpgradeable.UintToAddressMap;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    
    struct EscrowBox {
        Participant[] participants;
        mapping(address => uint256) participantsIndex;
	Trade[] trades;
	mapping(address => uint256) refunded;
        uint256 timeStart;
        uint256 timeEnd;
        uint256 duration;
        uint256 quorumCount
        bool sendBackAfterEscrow;
        bool lock;
        bool exists;
    }
    struct Participant {
        address addr;
        address token;
        uint256 min;
        uint256 balance;
        uint256 unlockedBalance;
        bool exists;
    }
    struct Trade {
        address from;
	address to;
	bool offchain;
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
    mapping(address => mapping(address => uint256)) recipientsFundsAvailable;
    mapping(address => mapping(address => mapping(address => uint256))) recipientsFundsUnlocked;
    
    WhitelistStruct judges; // addresses that can call judgment()
   
    EscrowBox internal escrowBox;
    
    event EscrowCreated(address indexed addr);
    event EscrowStarted(address indexed participant);
    event EscrowLocked();
    //event EscrowEnded();
    
    
    /**
     * Started Escrow mechanism
     * 
     * @param participants array of participants (one of complex arrays participants/tokens/minimums)
     * @param tokens array of tokens (one of complex arrays participants/tokens/minimums)
     * @param minimums array of minimums (one of complex arrays participants/tokens/minimums)
     * @param duration duration of escrow in seconds. will start since locked up to expire
     * @param quorumCount count of participants (which deposit own minimum). After last will initiate locked up
     * @param trades an array of trades to occur when the escrow.lock occurs
     * @param judges whitelist data struct
     *  address contractAddress;
	 *	bytes4 method;
	 *	uint8 role;
     *  bool useWhitelist;
     * @param costManager costManager address
     * @param producedBy address which asked factory to produce this instance
     */
    function init(
        address[] memory participants,
        address[] memory tokens,
        uint256[] memory minimums,
        uint256 duration,
        uint256 quorumCount,
        Trade[] memory trades,
        bool sendBackAfterEscrow,
        WhitelistStruct memory judges,
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
        
        emit EscrowCreated(msg.sender);
        
        require(participants.length > 0, "PARTICIPANTS_LIST_EMPTY");
        require(tokens.length > 0, "TOKENS_LIST_EMPTY");
        require(minimums.length > 0, "MINIMUMS_LIST_EMPTY");
        require(trades.length > 0, "TRADES_LIST_EMPTY");
        require((participants.length) >= quorumCount, "QUORUM_COUNT_TOO_LARGE");
        
        require((participants.length == tokens.length && tokens.length == minimums.length), "Parameters participants/tokens/minimums must be the same length");

        
        escrowBox.timeStart = 0;
        escrowBox.timeEnd = 0;
        escrowBox.duration = duration;
        escrowBox.lock = false;
        escrowBox.exists = true;

        escrowBox.quorumCount = (quorumCount == 0) ? participants.length : quorumCount;    
        
        whitelistInit(judges);
        
	uint256 i;
        for (i = 0; i < participants.length; ++i) {
            escrowBox.participantsIndex[participants[i]] = i;
            escrowBox.participants.push(Participant({
                addr: participants[i],
                token: tokens[i],
                min:  minimums[i],
                balance: 0,
                unlockedBalance: 0,
                exists: true
            }));
            
            //event
            emit EscrowStarted(participants[i]);
        }

        factory = msg.sender;
	producedBy = producedBy;

        uint256 indexP;
        
        for (i = 0; i < trades.length; i++) {
	    require(!trades[i].from.isContract(), "SEND_FROM_CANT_BE_CONTRACT");
            require(!trades[i].to.isContract(), "SEND_TO_CANT_BE_CONTRACT");

            escrowBox.trades.push(trades[i]);
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
    function deposit(address token) public nonReentrant()  {
        require(escrowBox.exists, "NO_SUCH_ESCROW");
        require(!escrowBox.lock, "ESCROW_ALREADY_LOCKED");
        
        // index can be zero for non-exists participants. we will check attr exists in struct
        uint256 index = escrowBox.participantsIndex[msg.sender]; 
        require(
            escrowBox.participants[index].exists && escrowBox.participants[index].addr == msg.sender, 
            "NO_SUCH_PARTICIPANT"
        );
        
        require(escrowBox.participants[index].token == token, "WRONG_TOKEN");
        
        
        uint256 _allowedAmount = IERC20Upgradeable(token).allowance(msg.sender, address(this));
        require((_allowedAmount > 0), "ALLOWANCE_EXCEEDED");
        // try to get
        bool success = IERC20Upgradeable(token).transferFrom(msg.sender, address(this), _allowedAmount);
        require(success, "TRANSFER_FAILED"); 
        
        escrowBox.participants[index].balance += _allowedAmount;
        
        if (escrowBox.participants[index].min <= escrowBox.participants[index].balance) {
            lock();
        }
        
        _accountForOperation(
            OPERATION_DEPOSIT << OPERATION_SHIFT_BITS,
            uint256(uint160(token)),
            uint256(uint160(msg.sender))
        );
    }
    
    /**
     * Can only be called by judges in  dispute.
     * Can be used to refund some funds in a Trade back to sender,
     * and/or unlock some to the recipient.
     * @param from address in trade
     * @param to address in a trade
     * @param participant the address which made the deposit
     */
    function judgment(address from, address to, uint256 refundAmount, uint256 unlockAmount)  {
        require (whitelisted(msg.sender), "REFUNDERS_ONLY");
	int256 index = -1;
	for (uint256 i = 0; i < trades.length; i++) {
            if (trades[i].from == from && trades[i].to == to) {
	    	index = int256(i);
		break;
	    }
        }
        require(
            escrowBox.participants[indexP].exists && escrowBox.participants[indexP].addr == msg.sender, 
            "NO_SUCH_PARTICIPANT"
        );
	uint256 indexFrom = escrowBox.participantsIndex[from]; 
	require(
            refundAmount + unlockAmount <= escrowBox.participants[indexFrom].balance - escrowBox.participants[indexFrom].unlockedBalance,
	    "JUDGMENT_EXCEEDS_REMAINING_AMOUNT"
	);
	// do unlock
	_unlock(trades[index].from, trades[index].to, trades[index].token, unlockAmount);
	// do refund
        success = IERC20Upgradeable(token).transfer(participant, amount);
        require(success, "TRANSFER_FAILED");
	refunded[from] += refundAmount;
    }
    
    /**
     * Unlock tokens (deposited earlier) for recipients
     * 
     * @param recipient token's address 
     * @param token token's address 
     * @param amount token's amount
     */
    function unlock(address recipient, address token, uint256 amount) public {
    	_unlock(msg.sender, recipient, token, amount);
    

    /**
     * Use this to leave ratings and reviews after paying a recipient.
     * @param recipient the one about whom the ratings and reviews are written
     * @param token the token that was paid to the recipient by msg.sender
     * @param URI the URI at which they would be hosted
     * @param hash the hash of the content at that URI, might be empty
     */
    function setResults(address recipient, address token, string URI, string hash) {
        require(escrowBox.exists, "NO_SUCH_ESCROW");
        require(escrowBox.lock, "ESCROW_NOT_LOCKED");
        require(bytes(URI).length > 0, "EMPTY_URI");
        require(pairExists, "NO_SUCH_PAIR");
	require(recipient == producedBy, "NOT_PRODUCED_BY_RECIPIENT");
	uint256 index = escrowBox.participantsIndex[msg.sender]; 
        require(
            escrowBox.participants[index].exists && escrowBox.participants[index].addr == msg.sender, 
            "NO_SUCH_PARTICIPANT"
        );
	require(recipientsFundsUnlocked[recipient][msg.sender][token] >= escrowBox.participants[index].balance / 2, "RECIPIENT_WASNT_PAID");
        IResults(factory).setResults(recipient, msg.sender, URI, hash);
    }
    
    /**
     * Before lock, used to withdraw all own deposited tokens.
     * After lock, used to withdraw all tokens deposited and unlocked for msg.sender by other participants.
     * Also, if escrow expired, sender can withdraw deposited tokens which were not unlocked yet
     */
    function withdraw() public nonReentrant() {
        require(escrowBox.exists, "NO_SUCH_ESCROW");
        
        // before locked up
        //// got own
        // in locked period
        //// got unlocked by other participants
        // after locked up expired
        //// got own left  
        uint256 amount;
        address token;
        uint256 indexP;
        uint256 indexR;
        bool success;
	bool canSendBack = (escrowBox.timeEnd <= block.timestamp);
        if (!escrowBox.lock || canSendBack) {
            indexP = escrowBox.participantsIndex[msg.sender]; 
            
            require(
                escrowBox.participants[indexP].exists && escrowBox.participants[indexP].addr == msg.sender, 
                "NO_SUCH_PARTICIPANT"
            );
            amount = escrowBox.participants[indexP].balance
	    	- (canSendBack ? escrowBox.participants[indexP].unlockedBalance : 0);
            token = escrowBox.participants[indexP].token;
            escrowBox.participants[indexP].balance = 0;
            
            success = IERC20Upgradeable(token).transfer(msg.sender, amount);
            require(success, "TRANSFER_FAILED");
        }
	if (escrowBox.lock) {
            
            for (uint256 i = 0; i < escrowBox.trades.length(); i++) {
                if (escrowBox.trades[i].from == msg.sender)  {
                    indexP = escrowBox.participantsIndex[escrowBox.trades[i].from];
                    token = trades[i].token;
                    amount = recipientsFundsAvailable[trades[i].to][token];
                    if (amount > 0) {
                        //escrowBox.recipients[indexR].fundsAvailable[token] = 0;
                        recipientsFundsAvailable[trades[i].to][token] = 0;
                        
                        success = IERC20Upgradeable(token).transfer(msg.sender, amount);
                        require(success, "TRANSFER_FAILED");
                    }
                }
            }
        }
    
        _accountForOperation(
            OPERATION_WITHDRAW << OPERATION_SHIFT_BITS,
            uint256(uint160(msg.sender)),
            0
        );
    }
    
    /**
     * Triggered after each deposit.
     * When a quorum of users deposited more than minimum, locks the escrow.
     */
    function lock() internal {
        require(escrowBox.exists, "NO_SUCH_ESCROW");
        require(!escrowBox.lock, "ESCROW_ALREADY_LOCKED");
        uint256 quorum = 0;
        for (uint256 i = 0; i < escrowBox.participants.length; i++) {
            if (escrowBox.participants[i].min <= escrowBox.participants[i].balance) {
                quorum++;
            }
        }
        
        if (quorum >= escrowBox.quorumCount) {
            escrowBox.lock = true;
            escrowBox.timeStart = block.timestamp;
            escrowBox.timeEnd = block.timestamp + escrowBox.duration;
            emit EscrowLocked();
        }
	
	// Execute all trades except offchain ones
	address recipient;
        address token;
        uint256 amountLeft = 0;
        uint256 indexP, indexR;
        for (uint256 i = 0; i < escrowBox.trades.length(); i++) {
            if (escrowBox.trades[i].from == msg.sender)  {
	    	if (escrowBox.trades[i].offchain) {
		    continue; // user will gradually unlock as things happen offchain
		}
                token = escrowBox.trades[i].token;
		require(
		    escrowBox.trades[i].amount <= escrowBox.participants[indexP].balance - escrowBox.participants[indexP].unlockedBalance,
		    "TRADE_AMOUNT_EXCEEDS_BALANCE"
		);
		recipient = escrowBox.trades[i].to;
		indexP = escrowBox.participantsIndex[msg.sender];
                escrowBox.participants[indexP].unlockedBalance += escrowBox.trades[i].amount;
                recipientsFundsAvailable[escrowBox.trades[i].to][token] += escrowBox.trades[i].amount;
            }
        }

    }
    
    ////////////////////////////////////////////////////////////////////////
    // internal section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    
    function _unlock(address sender, address recipient, address token, uint256 amount) public {
        require(escrowBox.exists, "NO_SUCH_ESCROW");
        require(escrowBox.lock, "ESCROW_NOT_LOCKED");
        // check exists sender in send from
        // check exists recipient in send to
        // also itis checked recipient as available 
        bool pairExists = false;
        for (uint256 i = 0; i < escrowBox.trades.length(); i++) {
            if (
                escrowBox.trades[i].from == sender &&
                escrowBox.trades[i].to == recipient
            )  {
                pairExists = true;
            }
        }
        require(pairExists, "NO_SUCH_PAIR");
        
        uint256 indexP = escrowBox.participantsIndex[sender]; 
        require(
            escrowBox.participants[indexP].exists && escrowBox.participants[indexP].addr == sender, 
            "NO_SUCH_PARTICIPANT"
        );
       
        
        // check correct token in sender
        require(escrowBox.participants[indexP].token == token, "WRONG_TOKEN");
        
        // check Available amount tokens at sender (and unlockedBalance not more than available)
        require(
            escrowBox.participants[indexP].balance - escrowBox.participants[indexP].unlockedBalance >= amount, 
            "BALANCE_EXCEEDED"
        );
        
        // write additional unlockedBalance at sender
        escrowBox.participants[indexP].unlockedBalance += amount;
        
        // write fundsAvailable at recipient
        //escrowBox.recipients[indexR].fundsAvailable[token] = (escrowBox.recipients[indexR].fundsAvailable[token]).add(amount);
        recipientsFundsAvailable[recipient][token] += amount;
	recipientsFundsUnlocked[recipient][sender][token] += amount;
        
        _accountForOperation(
            OPERATION_UNLOCK << OPERATION_SHIFT_BITS,
            uint256(uint160(sender)),
            uint256(uint160(token))
        );
    }
  
    
}

