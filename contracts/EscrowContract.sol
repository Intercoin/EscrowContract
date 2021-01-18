pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "./IntercoinTrait.sol";

contract EscrowContract is Initializable, OwnableUpgradeSafe, ReentrancyGuardUpgradeSafe, IntercoinTrait {
    
    using SafeMath for uint256;
    using Address for address;
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    struct EscrowBox {
        Participant[] participants;
        mapping(address => uint256) participantsIndex;
        Recipient[] recipients;
        mapping(address => uint256) recipientsIndex;
        uint256 timeStart;
        uint256 timeEnd;
        uint256 duration;
        uint256 quorumCount;
        EnumerableMap.UintToAddressMap swapFrom;
        EnumerableMap.UintToAddressMap swapTo;
        bool swapBackAfterEscrow;
        bool lock;
        bool exists;
    }
    struct Participant {
        address addr;
        address token;
        uint256 min;
        uint256 balance;
        uint256 unlockedBalance;
        uint256 recipientCount;
        bool exists;
    }
    struct Recipient {
        address addr;
        mapping(address => uint256) fundsAvailable; // token => Amount
        bool exists;
    }
   
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
     * @param swapFrom array of participants which resources swap from
     * @param swapTo array of participants which resources swap to
     * @param swapBackAfterEscrow if true, then: if withdraw is called after lock expired, and boxes still contain something, then SWAP BACK (swapTo->swapFrom) left resources
     */
    function init(
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
        initializer 
    {
        __Ownable_init();
        __ReentrancyGuard_init();
        
        emit EscrowCreated(_msgSender());
        
        require(participants.length > 0, "Participants list can not be empty");
        require(tokens.length > 0, "Tokens list can not be empty");
        require(minimums.length > 0, "Minimums list can not be empty");
        require(swapFrom.length > 0, "SwapFrom list can not be empty");
        require(swapTo.length > 0, "SwapTo list can not be empty");
        require((participants.length) >= quorumCount, "Wrong quorumCount");
        
        require((participants.length == tokens.length && tokens.length == minimums.length), "Parameters participants/tokens/minimums must be the same length");
        require((swapFrom.length == swapTo.length), "Parameters swapFrom/swapTo must be the same length");
        
        
        escrowBox.timeStart = 0;
        escrowBox.timeEnd = 0;
        escrowBox.duration = duration;
        escrowBox.swapBackAfterEscrow = swapBackAfterEscrow;
        escrowBox.lock = false;
        escrowBox.exists = true;

        escrowBox.quorumCount = (quorumCount == 0) ? participants.length : quorumCount;    
        
        for (uint256 i = 0; i < participants.length; i++) {
            escrowBox.participantsIndex[participants[i]] = i;
            
            escrowBox.participants.push(Participant({
                addr: participants[i],
                token: tokens[i],
                min:  minimums[i],
                balance: 0,
                unlockedBalance: 0,
                recipientCount: 0,
                exists: true
            }));
            
            //event
            EscrowStarted(participants[i]);
        }

        uint256 indexP;
        uint256 indexRtmpI;
        uint256 indexR = 0;
        
        escrowBox.recipients.push(Recipient({addr: address(swapTo[0]), exists: true}));
        escrowBox.recipientsIndex[swapTo[0]] = indexR;
        indexR++;
        
        for (uint256 i = 0; i < swapFrom.length; i++) {

            indexP = escrowBox.participantsIndex[swapFrom[i]];

            escrowBox.participants[indexP].recipientCount++;
            

            // swapTo section
            indexRtmpI = escrowBox.recipientsIndex[swapTo[i]];
            
            if ((escrowBox.recipients[indexRtmpI].exists == true) && (escrowBox.recipients[indexRtmpI].addr == swapTo[i])) {
                // 
            } else {
                escrowBox.recipients.push(Recipient({addr: address(swapTo[i]), exists: true}));
                escrowBox.recipientsIndex[swapTo[i]] = indexR;
                indexR++;
            }
        }
        _escrowPart2(swapFrom, swapTo);
    }
    
    /**
     * @dev Deposit token via approve the tokens on the exchange
     * @param token token's address 
     */
    function deposit(address token) public nonReentrant()  {
        require(escrowBox.exists == true, 'Such Escrow does not exists');
        require(escrowBox.lock == false, 'Such Escrow have already locked up');
        
        // index can be zero for non-exists participants. we will check attr exists in struct
        uint256 index = escrowBox.participantsIndex[_msgSender()]; 
        require(
            escrowBox.participants[index].exists == true && escrowBox.participants[index].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        require(escrowBox.participants[index].token == token, "Such token does not exists for this participant ");
        
        
        uint256 _allowedAmount = IERC20(token).allowance(_msgSender(), address(this));
        require((_allowedAmount > 0), "Amount exceeds allowed balance");
        // try to get
        bool success = IERC20(token).transferFrom(_msgSender(), address(this), _allowedAmount);
        require(success == true, "Transfer tokens were failed"); 
        
        escrowBox.participants[index].balance = escrowBox.participants[index].balance.add(_allowedAmount);
        
        if (escrowBox.participants[index].min <= escrowBox.participants[index].balance) {
            tryToLockEscrow();
        }
        
    }
    
    /**
     * Method unlocked tokens (deposited before) for recipients
     * 
     * @param recipient token's address 
     * @param token token's address 
     * @param amount token's amount
     */
    function unlock(address recipient, address token, uint256 amount) public {
        require(escrowBox.exists == true, 'Such Escrow does not exists');
        require(escrowBox.lock == true, 'Such Escrow have not locked yet');
        // check exists sender in swap from
        // check exists recipient in swap to
        // also itis checked recipient as available 
        bool pairExists = false;
        for (uint256 i = 0; i < escrowBox.swapFrom.length(); i++) {
            if (
                escrowBox.swapFrom.get(i) == _msgSender() &&
                escrowBox.swapTo.get(i) == recipient
            )  {
                pairExists = true;
            }
        }
        require(pairExists == true, 'Such participant is not exists via recipient');
        
        // check sender exist
        uint256 indexP = escrowBox.participantsIndex[_msgSender()]; 
        require(
            escrowBox.participants[indexP].exists == true && escrowBox.participants[indexP].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        
        uint256 indexR = escrowBox.recipientsIndex[recipient]; 
        
        // check correct token in sender
        require(escrowBox.participants[indexP].token == token, "Such token does not exists for this participant");
        
        // check Available amount tokens at sender (and unlockedBalance not more than available)
        require(
            (escrowBox.participants[indexP].balance).sub(escrowBox.participants[indexP].unlockedBalance) >= amount, 
            "Amount exceeds balance available to unlock"
        );
        
        // write additional unlockedBalance at sender
        escrowBox.participants[indexP].unlockedBalance = escrowBox.participants[indexP].unlockedBalance.add(amount);
        
        // write fundsAvailable at recipient
        escrowBox.recipients[indexR].fundsAvailable[token] = (escrowBox.recipients[indexR].fundsAvailable[token]).add(amount);
        
    }
    
    /**
     * Unlock all available tokens (deposited before) equally for recipents at `swap` pairs
     */
    function unlockAll() public {
        require(escrowBox.exists == true, 'Such Escrow does not exists');
        require(escrowBox.lock == true, 'Such Escrow have not locked yet');
        
        // check participant exist
        uint256 indexP = escrowBox.participantsIndex[_msgSender()]; 
        require(
            escrowBox.participants[indexP].exists == true && escrowBox.participants[indexP].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        address recipient;
        address token;
        uint256 recipientCount = 0;
        uint256 amountLeft = 0;
        uint256 indexR;
        for (uint256 i = 0; i < escrowBox.swapFrom.length(); i++) {
            if (escrowBox.swapFrom.get(i) == _msgSender())  {
                if (recipientCount == 0) {
                    recipientCount = escrowBox.participants[indexP].recipientCount;
                }
                indexR = escrowBox.recipientsIndex[escrowBox.swapTo.get(i)]; 
                
                amountLeft = escrowBox.participants[indexP].balance.sub(escrowBox.participants[indexP].unlockedBalance);
                
                recipient = escrowBox.swapTo.get(i);
                token = escrowBox.participants[indexP].token;
                
                escrowBox.participants[indexP].unlockedBalance = escrowBox.participants[indexP].unlockedBalance.add(amountLeft.div(recipientCount));
                escrowBox.recipients[indexR].fundsAvailable[token] = (escrowBox.recipients[indexR].fundsAvailable[token]).add(amountLeft.div(recipientCount));
                recipientCount--;
                
            }
        }
    }
    
    /**
     * withdraw all tokens deposited and unlocked from other participants
     */
    function withdraw() public nonReentrant() {
        require(escrowBox.exists == true, 'Such Escrow does not exists');
        
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
        if (escrowBox.lock == false) {
            indexP = escrowBox.participantsIndex[_msgSender()]; 
            
            require(
                escrowBox.participants[indexP].exists == true && escrowBox.participants[indexP].addr == _msgSender(), 
                "Such participant does not exists in this escrow"
            );
            amount = escrowBox.participants[indexP].balance;
            token = escrowBox.participants[indexP].token;
            escrowBox.participants[indexP].balance = 0;
            
            success = IERC20(token).transfer(_msgSender(), amount);
            require(success == true, 'Transfer tokens were failed');
    
    
        } else if (escrowBox.lock == true) {
            
            indexR = escrowBox.recipientsIndex[_msgSender()];
            
            for (uint256 i = 0; i < escrowBox.swapTo.length(); i++) {
                if (escrowBox.swapTo.get(i) == _msgSender())  {
                    indexP = escrowBox.participantsIndex[escrowBox.swapFrom.get(i)];
                    token = escrowBox.participants[indexP].token;
                    amount = escrowBox.recipients[indexR].fundsAvailable[token];
                    if (amount > 0) {
                        escrowBox.recipients[indexR].fundsAvailable[token] = 0;
                        success = IERC20(token).transfer(_msgSender(), amount);
                        require(success == true, 'Transfer tokens were failed');
                    }
                }
            }
            
            
            // also if escrow expired sender can gow own funds 
            if (
                //escrowBox.lock == true && 
                escrowBox.swapBackAfterEscrow == true &&
                escrowBox.timeEnd <= now
            ) {
                
                indexP = escrowBox.participantsIndex[_msgSender()]; 
                
                require(
                    escrowBox.participants[indexP].exists == true && escrowBox.participants[indexP].addr == _msgSender(), 
                    "Such participant does not exists in this escrow"
                );
                
                amount = escrowBox.participants[indexP].balance.sub(escrowBox.participants[indexP].unlockedBalance);
                token = escrowBox.participants[indexP].token;
                escrowBox.participants[indexP].balance = 0;
                
                success = IERC20(token).transfer(_msgSender(), amount);
                require(success == true, 'Transfer tokens were failed');
                
            }
        }
    
        
    }
    
    /**
     * triggered after each deposit if amoint more than minimum. if true, Escrow will be lock
     * 
     */
    function tryToLockEscrow() internal {
        require(escrowBox.lock == false, 'Such Escrow have already locked up');
        uint256 quorum = 0;
        for (uint256 i = 0; i < escrowBox.participants.length; i++) {
            if (escrowBox.participants[i].min <= escrowBox.participants[i].balance) {
                quorum = quorum.add(1);
            }
        }
        
        if (quorum >= escrowBox.quorumCount) {
            escrowBox.lock = true;
            escrowBox.timeStart = now;
            escrowBox.timeEnd = now.add(escrowBox.duration);
            EscrowLocked();
        }
    }
    
    
    /**
     * @dev continued part of escrow. Splitted to avoid exception "Stack too deep ..."
     * @param swapFrom array of participants which resources swap from
     * @param swapTo array of participants which resources swap to
     */
    function _escrowPart2(
        address[] memory swapFrom,
        address[] memory swapTo
    ) 
        private
    {
        for (uint256 i = 0; i < swapFrom.length; i++) {
            require(!swapFrom[i].isContract(), "address in `swapFrom` can not be a contract");
            require(!swapTo[i].isContract(), "address in `swapTo` can not be a contract");
            escrowBox.swapFrom.set(i, swapFrom[i]);
            escrowBox.swapTo.set(i, swapTo[i]);
        }
    }
    
}

