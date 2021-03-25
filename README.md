# EscrowContract
A smart contract with the ability to exchange one token against others.

# Deploy
when deploy it is need to pass parameters in to init method that started new escrow mechanism<br/>
Params:
name  | type | description
--|--|--
participants|address[]| addresses list of participants who will exchange own tokens. see Note#1
tokens|address[]| addresses list of tokens. see Note#1
minimums|uint256| minimum amount list of tokens. see Note#1
duration|uint256| escrow duration in seconds. started after escrow have been locked up
quorumCount|uint256| how participants need to deposit minimum tokens that escrow will be locked up
swapFrom|address[]| addresses list or participants which tokens will be swapped from. see Note#2
swapTo|address[]| addresses list or participants which tokens will be swapped to. see Note#2
swapBackAfterEscrow|bool| if true,  participants can withdraw own deposited tokens after escrow expired

# Methods
once installed will be use methods to exchange
Note that contract accept tokens, it should be approve before

### deposit<br/>
Params:
name  | type | description
--|--|--
tokens|address| address of token.

### unlock<br/>
Params:
name  | type | description
--|--|--
recipient|address|recipient address
token|address|address of token.
amount|uint256|amount

### unlockAll
there are no parameters

### withdraw
there are no parameters

# Examples
* life cycle 
    * deploy contract
    * all participants deposited own tokens until escrow locked up
    * escrow started and all participants starting to unlock own deposited tokens in favor to recipients. Now in any time recipients can withdraw tokens
    * if  duration passed - escrow are expired. Now all participants can withdraw own tokens which are not locked (if param `swapBackAfterEscrow` is true)
    
**Notes:**
1. participants/tokens/minimums are combined and linked arrays with the same length. 
It is means that if participant#1 have address '0x1111...' and want to trade 100 tokens with address '0x2222...'
than

> participants=['0x1111...']<br/>
tokens=['0x222...']<br/>
minimums=[100]<br/>


if will be added participant#2 with address '0x3333...' and want to trade 200 tokens with address '0x4444...'
than
> participants=['0x1111...','0x3333...']<br/>
tokens=['0x222...','0x4444...']<br/>
minimums=[100,200]<br/>

and so on
2. swapFrom/swapTo are combined and linked arrays with the same length too
