const BigNumber = require('bignumber.js');
const util = require('util');
const EscrowContract = artifacts.require("EscrowContract");
const EscrowContractMock = artifacts.require("EscrowContractMock");

const ERC20Mintable = artifacts.require("ERC20Mintable");

const truffleAssert = require('truffle-assertions');

const helper = require("../helpers/truffleTestHelper");

contract('EscrowContract', (accounts) => {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];  
    const accountThree = accounts[2];
    const accountFourth= accounts[3];
    const accountFive = accounts[4];
    const accountSix = accounts[5];
    const accountSeven = accounts[6];
    const accountEight = accounts[7];
    const accountNine = accounts[8];
    const accountTen = accounts[9];
    const accountEleven = accounts[10];
    const accountTwelwe = accounts[11];

    
    
    // setup useful values
    const decimals = 1000000000000000000;
    const oneEther = 1*decimals; // 1eth
    const zeroAddress = "0x0000000000000000000000000000000000000000";
  
    it('Escrow. Validate parameters. Method create', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance =  await EscrowContractMock.new({ from: accountOne});
        
            
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Participants list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Tokens list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Minimums list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "SwapFrom list can not be empty"
        );
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "SwapTo list can not be empty"
        );
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                555,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Wrong quorumCount"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountOne,accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300,120,3230],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Parameters participants/tokens/minimums must be the same length"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.init(
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 duration,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountOne, accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Parameters swapFrom/swapTo must be the same length"
        );
        
    });
  
    
    it('Escrow. Validate parameters. Deposit. "Such Escrow have already locked up" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });

        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        

        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree }),
            "Such Escrow have already locked up"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Such participant does not exists in this escrow" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountFourth ,'0x'+(200*decimals).toString(16), { from: accountOne });

        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountFourth });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(Token2Instance.address, { from: accountFourth }),
            "Such participant does not exists in this escrow"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Such token does not exists for this participant" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const Token4Instance = await ERC20Mintable.new('t4','t4');
        var EscrowContractInstance;
        
        await Token4Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });

        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token4Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountTwo });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(Token4Instance.address, { from: accountTwo }),
            "Such token does not exists for this participant"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Amount exceeds allowed balance" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree }),
            "Amount exceeds allowed balance"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such Escrow have not locked yet" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(accountThree, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such Escrow have not locked yet"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such participant is not exists via recipient" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
        
        // now locked
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock( accountFourth, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        // and try to send to recipient from another pair
        await truffleAssert.reverts(
            EscrowContractInstance.unlock( accountFourth, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        
    });
    
    it('Escrow. Validate parameters. Unlock. "Such participant does not exists in this escrow" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountFive ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree, accountFive],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock( accountFourth, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountFive }),
            "Such participant does not exists in this escrow"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such token does not exists for this participant" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock( accountThree, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such token does not exists for this participant"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Amount exceeds balance available to unlock" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree, accountFourth],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300,100],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree, accountFourth],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth, accountTwo],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock( accountTwo, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountFourth }),
            "Amount exceeds balance available to unlock"
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( accountThree, Token2Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountTwo, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            BigNumber(accountTwoEndingToken3Balance).toString(16), 
            BigNumber(accountThreeToken3Balance).toString(16), 
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken2Balance).toString(16), 
            BigNumber(accountTwoToken2Balance).toString(16), 
            'Wrong balance after swap for accountThree'
        );
        
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens = full exchange (withdraw after escrow expired))', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( accountThree, Token2Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountTwo, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            BigNumber(accountTwoEndingToken3Balance).toString(16), 
            BigNumber(accountThreeToken3Balance).toString(16), 
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken2Balance).toString(16), 
            BigNumber(accountTwoToken2Balance).toString(16), 
            'Wrong balance after swap for accountThree'
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens / swapBackAfterEscrow(true) = partly exchange', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( accountThree, Token2Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountTwo, Token3Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountThree});
      
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        // after swap
        assert.equal(
            BigNumber(accountTwoEndingToken3Balance).toString(16), 
            BigNumber(150*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken2Balance).toString(16), 
            BigNumber(150*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        
        // left after withdraw own
        assert.equal(
            BigNumber(accountTwoEndingToken2Balance).toString(16), 
            BigNumber((200-150)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken3Balance).toString(16), 
            BigNumber((300-150)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens / swapBackAfterEscrow(true) = partly exchange (withdraw after escrow expired))', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( accountThree, Token2Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountTwo, Token3Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountThree});
        
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        // after swap
        assert.equal(
            BigNumber(accountTwoEndingToken3Balance).toString(16), 
            BigNumber(150*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken2Balance).toString(16), 
            BigNumber(150*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        
        // left after withdraw own
        assert.equal(
            BigNumber(accountTwoEndingToken2Balance).toString(16), 
            BigNumber((200-150)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken3Balance).toString(16), 
            BigNumber((300-150)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        // ----
    });

    it('Escrow test(4 participants / 2 recipients / 2 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountFourth ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountFive ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo,accountThree,accountFourth,accountFive],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address,Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300,200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            4,// uint256 quorumCount,
            [accountTwo,accountThree,accountFourth,accountFive],// address[] memory swapFrom,
            [accountSix,accountSeven,accountSix,accountSeven],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne}
        );
 
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountThree });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountFourth });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountFourth });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountFive });
        await EscrowContractInstance.deposit(Token3Instance.address, { from: accountFive });
      
        // now locked
        
       
        // trying to unlock
        await EscrowContractInstance.unlock( accountSix, Token2Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountSeven, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        await EscrowContractInstance.unlock( accountSix, Token2Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountFourth});
        await EscrowContractInstance.unlock( accountSeven, Token3Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountFive});
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountSix});
        await EscrowContractInstance.withdraw( {from: accountSeven});
        
        const accountSixEndingToken2Balance = (await Token2Instance.balanceOf(accountSix));
        const accountSevenEndingToken3Balance = (await Token3Instance.balanceOf(accountSeven));
      
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        const accountFourthEndingToken2Balance = (await Token2Instance.balanceOf(accountFourth));
        const accountFiveEndingToken3Balance = (await Token3Instance.balanceOf(accountFive));
        
        assert.equal(
            BigNumber(accountTwoEndingToken2Balance).toString(16), 
            BigNumber((0)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );
        assert.equal(
            BigNumber(accountThreeEndingToken3Balance).toString(16), 
            BigNumber((0)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        assert.equal(
            BigNumber(accountFourthEndingToken2Balance).toString(16), 
            BigNumber((0)*decimals).toString(16),
            'Wrong balance after swap for accountFourth'
        );
        assert.equal(
            BigNumber(accountFiveEndingToken3Balance).toString(16), 
            BigNumber((0)*decimals).toString(16),
            'Wrong balance after swap for accountFive'
        );
        
        assert.equal(
            BigNumber(accountSixEndingToken2Balance).toString(16), 
            BigNumber((200+200)*decimals).toString(16),
            'Wrong balance after swap for accountSix'
        );

        assert.equal(
            BigNumber(accountSevenEndingToken3Balance).toString(16), 
            BigNumber((300+300)*decimals).toString(16),
            'Wrong balance after swap for accountSeven'
        );
        
    });
  
    it('Escrow test(1 participant / 2 recipients(fifty-fifty) / 1 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');

        var EscrowContractInstance;
        
        await Token2Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });

        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));

        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [accountTwo],// address[] memory participants,
            [Token2Instance.address],// address[] memory tokens,
            [200],// uint256[] memory minimums,
            10,// uint256 duration,
            1,// uint256 quorumCount,
            [accountTwo, accountTwo],// address[] memory swapFrom,
            [accountFourth, accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
            , { from: accountOne}
        );
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountTwo });
      
        // now locked
        
        // trying to unlock
        // await EscrowContractInstance.unlock( accountThree, Token2Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        // await EscrowContractInstance.unlock( accountFourth, Token2Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlockAll( {from: accountTwo});
        

        // withdraw
        await EscrowContractInstance.withdraw( {from: accountFourth});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountFourthEndingToken2Balance = (await Token2Instance.balanceOf(accountFourth));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            BigNumber(accountFourthEndingToken2Balance).toString(16), 
            BigNumber(100*decimals).toString(16), 
            'Wrong balance after swap for accountFourth'
        );

        assert.equal(
            BigNumber(accountThreeEndingToken2Balance).toString(16), 
            BigNumber(100*decimals).toString(16), 
            'Wrong balance after swap for accountThree'
        );
        
    });

});
