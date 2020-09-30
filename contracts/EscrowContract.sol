pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./openzeppelin-contracts/contracts/utils/EnumerableMap.sol";
import "./openzeppelin-contracts/contracts/utils/EnumerableSet.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";
import "./openzeppelin-contracts/contracts/math/SafeMath.sol";
import "./openzeppelin-contracts/contracts/utils/Address.sol";


contract EscrowContract is Ownable {
    
    using SafeMath for uint256;
    using Address for address;
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    struct EscrowBox {
        Participant[] participants;
        mapping(address => uint256) participantsIndex;
        Recipient[] recipients;
        mapping(address => uint256) recipientsIndex;
        uint256 blockFrom;
        uint256 blockTo;
        uint256 blockCount;
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
   
    mapping(uint256 => EscrowBox) internal escrowBoxes;
    
    event EscrowCreated(address indexed addr, uint256 indexed escrowID);
    event EscrowStarted(address indexed participant, uint256 indexed escrowID);
    event EscrowLocked(uint256 indexed escrowID);
    //event EscrowEnded(uint256 indexed escrowID);
    
    /**
     * Started Escrow mechanism
     * 
     * @param participants array of participants (one of complex arrays participants/tokens/minimums)
     * @param tokens array of tokens (one of complex arrays participants/tokens/minimums)
     * @param minimums array of minimums (one of complex arrays participants/tokens/minimums)
     * @param blockCount duration of escrow in blocks
     * @param quorumCount count of participants (which deposit own minimum). After last will initiate locked up
     * @param swapFrom array of participants which resources swap from
     * @param swapTo array of participants which resources swap to
     * @param swapBackAfterEscrow if true, then: if withdraw is called after lock expired, and boxes still contain something, then SWAP BACK (swapTo->swapFrom) left resources
     */
    function escrow (
        address[] memory participants,
        address[] memory tokens,
        uint256[] memory minimums,
        uint256 blockCount,
        uint256 quorumCount,
        address[] memory swapFrom,
        address[] memory swapTo,
        bool swapBackAfterEscrow
    ) public onlyOwner {
        
        uint256 escrowID = generateEscrowID();
        emit EscrowCreated(_msgSender(), escrowID);
        
        require(escrowBoxes[escrowID].exists == false, "Such Escrow is already exists");
        require(participants.length > 0, "Participants list can not be empty");
        require(tokens.length > 0, "Tokens list can not be empty");
        require(minimums.length > 0, "Minimums list can not be empty");
        require(swapFrom.length > 0, "SwapFrom list can not be empty");
        require(swapTo.length > 0, "SwapTo list can not be empty");
        require((participants.length) >= quorumCount, "Wrong quorumCount");
        
        require((participants.length == tokens.length && tokens.length == minimums.length), "Parameters participants/tokens/minimums must be the same length");
        require((swapFrom.length == swapTo.length), "Parameters swapFrom/swapTo must be the same length");
        
        
        escrowBoxes[escrowID].blockFrom = 0;
        escrowBoxes[escrowID].blockTo = 0;
        escrowBoxes[escrowID].blockCount = blockCount;
        escrowBoxes[escrowID].swapBackAfterEscrow = swapBackAfterEscrow;
        escrowBoxes[escrowID].lock = false;
        escrowBoxes[escrowID].exists = true;

        escrowBoxes[escrowID].quorumCount = (quorumCount == 0) ? participants.length : quorumCount;    
        
        for (uint256 i = 0; i < participants.length; i++) {
            escrowBoxes[escrowID].participantsIndex[participants[i]] = i;
            
            escrowBoxes[escrowID].participants.push(Participant({
                addr: participants[i],
                token: tokens[i],
                min:  minimums[i],
                balance: 0,
                unlockedBalance: 0,
                recipientCount: 0,
                exists: true
            }));
            
            //event
            EscrowStarted(participants[i], escrowID);
        }

        uint256 indexP;
        uint256 indexRtmpI;
        uint256 indexR = 0;
        
        escrowBoxes[escrowID].recipients.push(Recipient({addr: address(swapTo[0]), exists: true}));
        escrowBoxes[escrowID].recipientsIndex[swapTo[0]] = indexR;
        indexR++;
        
        for (uint256 i = 0; i < swapFrom.length; i++) {

            indexP = escrowBoxes[escrowID].participantsIndex[swapFrom[i]];

            escrowBoxes[escrowID].participants[indexP].recipientCount++;
            

            // swapTo section
            indexRtmpI = escrowBoxes[escrowID].recipientsIndex[swapTo[i]];
            
            if ((escrowBoxes[escrowID].recipients[indexRtmpI].exists == true) && (escrowBoxes[escrowID].recipients[indexRtmpI].addr == swapTo[i])) {
                // 
            } else {
                escrowBoxes[escrowID].recipients.push(Recipient({addr: address(swapTo[i]), exists: true}));
                escrowBoxes[escrowID].recipientsIndex[swapTo[i]] = indexR;
                indexR++;
            }
        }
        _escrowPart2(escrowID, swapFrom, swapTo);
    }
    
    /**
     * @dev Deposit token via approve the tokens on the exchange
     * @param escrowID escrow identificator
     * @param token token's address 
     */
    function deposit(uint256 escrowID, address token) public  {
        require(escrowBoxes[escrowID].exists == true, 'Such Escrow does not exists');
        require(escrowBoxes[escrowID].lock == false, 'Such Escrow have already locked up');
        
        // index can be zero for non-exists participants. we will check attr exists in struct
        uint256 index = escrowBoxes[escrowID].participantsIndex[_msgSender()]; 
        require(
            escrowBoxes[escrowID].participants[index].exists == true && escrowBoxes[escrowID].participants[index].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        require(escrowBoxes[escrowID].participants[index].token == token, "Such token does not exists for this participant ");
        
        
        uint256 _allowedAmount = IERC20(token).allowance(_msgSender(), address(this));
        require((_allowedAmount > 0), "Amount exceeds allowed balance");
        // try to get
        bool success = IERC20(token).transferFrom(_msgSender(), address(this), _allowedAmount);
        require(success == true, "Transfer tokens were failed"); 
        
        escrowBoxes[escrowID].participants[index].balance = escrowBoxes[escrowID].participants[index].balance.add(_allowedAmount);
        
        if (escrowBoxes[escrowID].participants[index].min <= escrowBoxes[escrowID].participants[index].balance) {
            tryToLockEscrow(escrowID);
        }
        
    }
    
    /**
     * Method unlocked tokens (deposited before) for recipients
     * 
     * @param escrowID escrow identificator
     * @param recipient token's address 
     * @param token token's address 
     * @param amount token's amount
     */
    function unlock(uint256 escrowID, address recipient, address token, uint256 amount) public {
        require(escrowBoxes[escrowID].exists == true, 'Such Escrow does not exists');
        require(escrowBoxes[escrowID].lock == true, 'Such Escrow have not locked yet');
        // check exists sender in swap from
        // check exists recipient in swap to
        // also itis checked recipient as available 
        bool pairExists = false;
        for (uint256 i = 0; i < escrowBoxes[escrowID].swapFrom.length(); i++) {
            if (
                escrowBoxes[escrowID].swapFrom.get(i) == _msgSender() &&
                escrowBoxes[escrowID].swapTo.get(i) == recipient
            )  {
                pairExists = true;
            }
        }
        require(pairExists == true, 'Such participant is not exists via recipient');
        
        // check sender exist
        uint256 indexP = escrowBoxes[escrowID].participantsIndex[_msgSender()]; 
        require(
            escrowBoxes[escrowID].participants[indexP].exists == true && escrowBoxes[escrowID].participants[indexP].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        
        uint256 indexR = escrowBoxes[escrowID].recipientsIndex[recipient]; 
        
        // check correct token in sender
        require(escrowBoxes[escrowID].participants[indexP].token == token, "Such token does not exists for this participant");
        
        // check Available amount tokens at sender (and unlockedBalance not more than available)
        require(
            (escrowBoxes[escrowID].participants[indexP].balance).sub(escrowBoxes[escrowID].participants[indexP].unlockedBalance) >= amount, 
            "Amount exceeds balance available to unlock"
        );
        
        // write additional unlockedBalance at sender
        escrowBoxes[escrowID].participants[indexP].unlockedBalance = escrowBoxes[escrowID].participants[indexP].unlockedBalance.add(amount);
        
        // write fundsAvailable at recipient
        escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token] = (escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token]).add(amount);
        
    }
    
    /**
     * Unlock all available tokens (deposited before) equally for recipents at `swap` pairs
     * @param escrowID escrow identificator
     */
    function unlockAll(uint256 escrowID) public {
        require(escrowBoxes[escrowID].exists == true, 'Such Escrow does not exists');
        require(escrowBoxes[escrowID].lock == true, 'Such Escrow have not locked yet');
        
        // check participant exist
        uint256 indexP = escrowBoxes[escrowID].participantsIndex[_msgSender()]; 
        require(
            escrowBoxes[escrowID].participants[indexP].exists == true && escrowBoxes[escrowID].participants[indexP].addr == _msgSender(), 
            "Such participant does not exists in this escrow"
        );
        
        address recipient;
        address token;
        uint256 recipientCount = 0;
        uint256 amountLeft = 0;
        uint256 indexR;
        for (uint256 i = 0; i < escrowBoxes[escrowID].swapFrom.length(); i++) {
            if (escrowBoxes[escrowID].swapFrom.get(i) == _msgSender())  {
                if (recipientCount == 0) {
                    recipientCount = escrowBoxes[escrowID].participants[indexP].recipientCount;
                }
                indexR = escrowBoxes[escrowID].recipientsIndex[escrowBoxes[escrowID].swapTo.get(i)]; 
                
                amountLeft = escrowBoxes[escrowID].participants[indexP].balance.sub(escrowBoxes[escrowID].participants[indexP].unlockedBalance);
                
                recipient = escrowBoxes[escrowID].swapTo.get(i);
                token = escrowBoxes[escrowID].participants[indexP].token;
                
                escrowBoxes[escrowID].participants[indexP].unlockedBalance = escrowBoxes[escrowID].participants[indexP].unlockedBalance.add(amountLeft.div(recipientCount));
                escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token] = (escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token]).add(amountLeft.div(recipientCount));
                recipientCount--;
                
            }
        }
    }
    
    /**
     * withdraw all tokens deposited and unlocked from other participants
     * @param escrowID escrow identificator
     */
    function withdraw(uint256 escrowID) public {
        require(escrowBoxes[escrowID].exists == true, 'Such Escrow does not exists');
        
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
        if (escrowBoxes[escrowID].lock == false) {
            indexP = escrowBoxes[escrowID].participantsIndex[_msgSender()]; 
            
            require(
                escrowBoxes[escrowID].participants[indexP].exists == true && escrowBoxes[escrowID].participants[indexP].addr == _msgSender(), 
                "Such participant does not exists in this escrow"
            );
            amount = escrowBoxes[escrowID].participants[indexP].balance;
            token = escrowBoxes[escrowID].participants[indexP].token;
            escrowBoxes[escrowID].participants[indexP].balance = 0;
            
            success = IERC20(token).transfer(_msgSender(), amount);
            require(success == true, 'Transfer tokens were failed');
    
    
        } else if (escrowBoxes[escrowID].lock == true) {
            
            indexR = escrowBoxes[escrowID].recipientsIndex[_msgSender()];
            
            for (uint256 i = 0; i < escrowBoxes[escrowID].swapTo.length(); i++) {
                if (escrowBoxes[escrowID].swapTo.get(i) == _msgSender())  {
                    indexP = escrowBoxes[escrowID].participantsIndex[escrowBoxes[escrowID].swapFrom.get(i)];
                    token = escrowBoxes[escrowID].participants[indexP].token;
                    amount = escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token];
                    if (amount > 0) {
                        escrowBoxes[escrowID].recipients[indexR].fundsAvailable[token] = 0;
                        success = IERC20(token).transfer(_msgSender(), amount);
                        require(success == true, 'Transfer tokens were failed');
                    }
                }
            }
            
            
            // also if escrow expired sender can gow own funds 
            if (
                //escrowBoxes[escrowID].lock == true && 
                escrowBoxes[escrowID].swapBackAfterEscrow == true &&
                escrowBoxes[escrowID].blockTo < block.number
            ) {
                
                indexP = escrowBoxes[escrowID].participantsIndex[_msgSender()]; 
                
                require(
                    escrowBoxes[escrowID].participants[indexP].exists == true && escrowBoxes[escrowID].participants[indexP].addr == _msgSender(), 
                    "Such participant does not exists in this escrow"
                );
                
                amount = escrowBoxes[escrowID].participants[indexP].balance.sub(escrowBoxes[escrowID].participants[indexP].unlockedBalance);
                token = escrowBoxes[escrowID].participants[indexP].token;
                escrowBoxes[escrowID].participants[indexP].balance = 0;
                
                success = IERC20(token).transfer(_msgSender(), amount);
                require(success == true, 'Transfer tokens were failed');
                
            }
        }
    
        
    }
    
    /**
     * method generated random Int. will be used as ID for escrow
     */
    function generateEscrowID() private returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            now, 
            block.difficulty, 
            msg.sender
        )));    
    }
    
    /**
     * triggered after each deposit if amoint more than minimum. if true, Escrow will be lock
     * @param escrowID escrow identificator
     * 
     */
    function tryToLockEscrow(uint256 escrowID) internal {
        require(escrowBoxes[escrowID].lock == false, 'Such Escrow have already locked up');
        uint256 quorum = 0;
        for (uint256 i = 0; i < escrowBoxes[escrowID].participants.length; i++) {
            if (escrowBoxes[escrowID].participants[i].min <= escrowBoxes[escrowID].participants[i].balance) {
                quorum = quorum.add(1);
            }
        }
        
        if (quorum >= escrowBoxes[escrowID].quorumCount) {
            escrowBoxes[escrowID].lock = true;
            EscrowLocked(escrowID);
        }
    }
    
    
    /**
     * @dev continued part of escrow. Splitted to avoid exception "Stack too deep ..."
     * @param escrowID Escrow Identificator
     * @param swapFrom array of participants which resources swap from
     * @param swapTo array of participants which resources swap to
     */
    function _escrowPart2(
        uint256 escrowID,
        address[] memory swapFrom,
        address[] memory swapTo
    ) 
        private
    {
        for (uint256 i = 0; i < swapFrom.length; i++) {
            require(!swapFrom[i].isContract(), "address in `swapFrom` can not be a contract");
            require(!swapTo[i].isContract(), "address in `swapTo` can not be a contract");
            escrowBoxes[escrowID].swapFrom.set(i, swapFrom[i]);
            escrowBoxes[escrowID].swapTo.set(i, swapTo[i]);
        }
    }
    
    
    
    
    
    
    
}

