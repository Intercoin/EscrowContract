
# EscrowContract
A smart contract with the ability to exchange one token against others.
# Deploy
when deploy it is no need to pass parameters in to constructor

# Methods
once installed will be use methods to exchange
Note that contract accept tokens, it should be approve before

### escrow
Method started new escrow mechanism

Params:
name  | type | description
--|--|--
participants|address[]| addresses list of participants who will exchange own tokens. see Note#1
tokens|address[]| addresses list of tokens. see Note#1
minimums|uint256| minimum amount list of tokens. see Note#1
blockCount|uint256| escrow duration in blocks. started after escrow have been locked up
quorumCount|uint256| how participants need to deposit minimum tokens that escrow will be locked up
swapFrom|address[]| addresses list or participants which tokens will be swapped from. see Note#2
swapTo|address[]| addresses list or participants which tokens will be swapped to. see Note#2
swapBackAfterEscrow|bool| if true,  participants can withdraw own deposited tokens after escrow expired

### deposit
Params:
name  | type | description
--|--|--
escrowID|uint256|Escrow Identificator. getting by event after creating by `escrow`
tokens|address| address of token.

### unlock
Params:
name  | type | description
--|--|--
escrowID|uint256|Escrow Identificator. getting by event after creating by `escrow`
recipient|address|recipient address
token|address|address of token.
amount|uint256|amount

### unlockAll
name  | type | description
--|--|--
escrowID|uint256|Escrow Identificator. getting by event after creating by `escrow`

### withdraw
Params:
name  | type | description
--|--|--
escrowID|uint256|Escrow Identificator. getting by event after creating by `escrow`

# Examples
* life cycle 
    * send transaction escrow
    * all participants deposited own tokens until escrow locked up
    * escrow started and all participants starting to unlock own deposited tokens in favor to recipients. Now in any time recipients can withdraw tokens
    * if  blockCount passed - escrow are expired. Now all participants can with drazw own tokens which are not locked (if param `swapBackAfterEscrow` is true)
    
**Notes:**
1. participants/tokens/minimums are combined and linked arrays with the same length. 
It is means that if participant#1 have address '0x1111...' and want to trade 100 tokens with address '0x2222...'
than

> participants=['0x1111...']
tokens=['0x222...']
minimums=[100]


if will be added participant#2 with address '0x3333...' and want to trade 200 tokens with address '0x4444...'
than
> participants=['0x1111...','0x3333...']
tokens=['0x222...','0x4444...']
minimums=[100,200]

and so on
2. swapFrom/swapTo are combined and linked arrays with the same length too
