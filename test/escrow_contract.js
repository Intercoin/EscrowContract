const BN = require('bn.js'); // https://github.com/indutny/bn.js
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
        const EscrowContractInstance = await EscrowContractMock.new();
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Participants list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Tokens list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Minimums list can not be empty"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "SwapFrom list can not be empty"
        );
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "SwapTo list can not be empty"
        );
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                555,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Wrong quorumCount"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountOne,accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300,120,3230],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Parameters participants/tokens/minimums must be the same length"
        );
        
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountOne, accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Parameters swapFrom/swapTo must be the same length"
        );
        
    });
    
    it('Escrow. Validate parameters. Deposit. "Such Escrow does not exists" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo }),
            "Such Escrow does not exists"
        );
        
    });
    
    it('Escrow. Validate parameters. Deposit. "Such Escrow have already locked up" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree }),
            "Such Escrow have already locked up"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Such participant does not exists in this escrow" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountFourth ,'0x'+(200*decimals).toString(16), { from: accountOne });

        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountFourth });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountFourth }),
            "Such participant does not exists in this escrow"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Such token does not exists for this participant" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const Token4Instance = await ERC20Mintable.new('t4','t4');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token4Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });

        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token4Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountTwo });
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(escrowID,Token4Instance.address, { from: accountTwo }),
            "Such token does not exists for this participant"
        );
    });
    
    it('Escrow. Validate parameters. Deposit. "Amount exceeds allowed balance" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            1,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await truffleAssert.reverts(
            EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree }),
            "Amount exceeds allowed balance"
        );
    });
   
    it('Escrow. Validate parameters. Unlock. "Such Escrow does not exists" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID,accountTwo, Token3Instance.address, '0x'+(200*decimals).toString(16), { from: accountTwo }),
            "Such Escrow does not exists"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such Escrow have not locked yet" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID,accountThree, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such Escrow have not locked yet"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such participant is not exists via recipient" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
        
        // now locked
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID, accountFourth, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        // and try to send to recipient from another pair
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID, accountFourth, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        
    });
    
    it('Escrow. Validate parameters. Unlock. "Such participant does not exists in this escrow" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountFive ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree, accountFive],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID, accountFourth, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountFive }),
            "Such participant does not exists in this escrow"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such token does not exists for this participant" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID, accountThree, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such token does not exists for this participant"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Amount exceeds balance available to unlock" ', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree, accountFourth],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300,100],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo,accountThree, accountFourth],// address[] memory swapFrom,
            [accountTwo,accountThree,accountFourth, accountTwo],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
        
        await truffleAssert.reverts(
            EscrowContractInstance.unlock(escrowID, accountTwo, Token3Instance.address, '0x'+(300*decimals).toString(16), { from: accountFourth }),
            "Amount exceeds balance available to unlock"
        );
    });

    it('Escrow. Validate parameters. Avoid duplicate escrowID', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            50,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
            , { from: accountOne}
        );
        
        //
        await truffleAssert.reverts(
            EscrowContractInstance.escrow(
                escrowID, 
                [accountTwo,accountThree],// address[] memory participants,
                [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
                [200,300],// uint256[] memory minimums,
                50,// uint256 blockCount,
                2,// uint256 quorumCount,
                [accountThree,accountTwo],// address[] memory swapFrom,
                [accountTwo,accountThree],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
                , { from: accountOne}
            ),
            "Such Escrow is already exists"
        );
        
        
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock(escrowID, accountThree, Token2Instance.address, '0x'+(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock(escrowID, accountTwo, Token3Instance.address, '0x'+(300*decimals).toString(16), {from: accountThree});
        
        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountTwo});
        await EscrowContractInstance.withdraw(escrowID, {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            (new BN(accountTwoEndingToken3Balance,10)).toString(16), 
            (new BN(accountThreeToken3Balance,10)).toString(16), 
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken2Balance,10)).toString(16), 
            (new BN(accountTwoToken2Balance,10)).toString(16), 
            'Wrong balance after swap for accountThree'
        );
        
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens = full exchange (withdraw after escrow expired))', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock(escrowID, accountThree, Token2Instance.address, '0x'+(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock(escrowID, accountTwo, Token3Instance.address, '0x'+(300*decimals).toString(16), {from: accountThree});
        
        // pass 100 block. 
        for (let i=0; i<100; i++) {
            await helper.advanceBlock();
        }
        
        
        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountTwo});
        await EscrowContractInstance.withdraw(escrowID, {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            (new BN(accountTwoEndingToken3Balance,10)).toString(16), 
            (new BN(accountThreeToken3Balance,10)).toString(16), 
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken2Balance,10)).toString(16), 
            (new BN(accountTwoToken2Balance,10)).toString(16), 
            'Wrong balance after swap for accountThree'
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens / swapBackAfterEscrow(true) = partly exchange', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock(escrowID, accountThree, Token2Instance.address, '0x'+(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock(escrowID, accountTwo, Token3Instance.address, '0x'+(150*decimals).toString(16), {from: accountThree});
      
        
        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountTwo});
        await EscrowContractInstance.withdraw(escrowID, {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        // after swap
        assert.equal(
            (new BN(accountTwoEndingToken3Balance,10)).toString(16), 
            (150*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken2Balance,10)).toString(16), 
            (150*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        
        // left after withdraw own
        assert.equal(
            (new BN(accountTwoEndingToken2Balance,10)).toString(16), 
            ((200-150)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken3Balance,10)).toString(16), 
            ((300-150)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens / swapBackAfterEscrow(true) = partly exchange (withdraw after escrow expired))', async () => {
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            2,// uint256 quorumCount,
            [accountThree,accountTwo],// address[] memory swapFrom,
            [accountTwo,accountThree],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
      
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock(escrowID, accountThree, Token2Instance.address, '0x'+(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock(escrowID, accountTwo, Token3Instance.address, '0x'+(150*decimals).toString(16), {from: accountThree});
        
        // pass 100 block. 
        for (let i=0; i<100; i++) {
            await helper.advanceBlock();
        }
        
        
        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountTwo});
        await EscrowContractInstance.withdraw(escrowID, {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token3Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        
        // after swap
        assert.equal(
            (new BN(accountTwoEndingToken3Balance,10)).toString(16), 
            (150*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken2Balance,10)).toString(16), 
            (150*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        
        // left after withdraw own
        assert.equal(
            (new BN(accountTwoEndingToken2Balance,10)).toString(16), 
            ((200-150)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );

        assert.equal(
            (new BN(accountThreeEndingToken3Balance,10)).toString(16), 
            ((300-150)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        // ----
    });

    it('Escrow test(4 participants / 2 recipients / 2 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');
        const Token3Instance = await ERC20Mintable.new('t3','t3');
        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountThree ,'0x'+(300*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountFourth ,'0x'+(200*decimals).toString(16), { from: accountOne });
        await Token3Instance.mint(accountFive ,'0x'+(300*decimals).toString(16), { from: accountOne });
    
        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo,accountThree,accountFourth,accountFive],// address[] memory participants,
            [Token2Instance.address, Token3Instance.address,Token2Instance.address, Token3Instance.address],// address[] memory tokens,
            [200,300,200,300],// uint256[] memory minimums,
            100,// uint256 blockCount,
            4,// uint256 quorumCount,
            [accountTwo,accountThree,accountFourth,accountFive],// address[] memory swapFrom,
            [accountSix,accountSeven,accountSix,accountSeven],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne}
        );
 
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountThree });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountFourth });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountFourth });
        
        await Token3Instance.approve(EscrowContractInstance.address,'0x'+(300*decimals).toString(16), { from: accountFive });
        await EscrowContractInstance.deposit(escrowID,Token3Instance.address, { from: accountFive });
      
        // now locked
        
       
        // trying to unlock
        await EscrowContractInstance.unlock(escrowID, accountSix, Token2Instance.address, '0x'+(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock(escrowID, accountSeven, Token3Instance.address, '0x'+(300*decimals).toString(16), {from: accountThree});
        await EscrowContractInstance.unlock(escrowID, accountSix, Token2Instance.address, '0x'+(200*decimals).toString(16), {from: accountFourth});
        await EscrowContractInstance.unlock(escrowID, accountSeven, Token3Instance.address, '0x'+(300*decimals).toString(16), {from: accountFive});
        
        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountSix});
        await EscrowContractInstance.withdraw(escrowID, {from: accountSeven});
        
        const accountSixEndingToken2Balance = (await Token2Instance.balanceOf(accountSix));
        const accountSevenEndingToken3Balance = (await Token3Instance.balanceOf(accountSeven));
      
        const accountTwoEndingToken2Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token3Instance.balanceOf(accountThree));
        const accountFourthEndingToken2Balance = (await Token2Instance.balanceOf(accountFourth));
        const accountFiveEndingToken3Balance = (await Token3Instance.balanceOf(accountFive));
        
        assert.equal(
            (new BN(accountTwoEndingToken2Balance,10)).toString(16), 
            ((0)*decimals).toString(16),
            'Wrong balance after swap for accountTwo'
        );
        assert.equal(
            (new BN(accountThreeEndingToken3Balance,10)).toString(16), 
            ((0)*decimals).toString(16),
            'Wrong balance after swap for accountThree'
        );
        assert.equal(
            (new BN(accountFourthEndingToken2Balance,10)).toString(16), 
            ((0)*decimals).toString(16),
            'Wrong balance after swap for accountFourth'
        );
        assert.equal(
            (new BN(accountFiveEndingToken3Balance,10)).toString(16), 
            ((0)*decimals).toString(16),
            'Wrong balance after swap for accountFive'
        );
        
        assert.equal(
            (new BN(accountSixEndingToken2Balance,10)).toString(16), 
            ((200+200)*decimals).toString(16),
            'Wrong balance after swap for accountSix'
        );

        assert.equal(
            (new BN(accountSevenEndingToken3Balance,10)).toString(16), 
            ((300+300)*decimals).toString(16),
            'Wrong balance after swap for accountSeven'
        );
        
    });
  
    it('Escrow test(1 participant / 2 recipients(fifty-fifty) / 1 tokens = full exchange)', async () => {
        
        const Token2Instance = await ERC20Mintable.new('t2','t2');

        const EscrowContractInstance = await EscrowContractMock.new();
        
        await Token2Instance.mint(accountTwo ,'0x'+(200*decimals).toString(16), { from: accountOne });

        const accountTwoToken2Balance = (await Token2Instance.balanceOf(accountTwo));

        
        let escrowID = (await EscrowContractInstance.generateEscrowID());
        
        await EscrowContractInstance.escrow(
            escrowID, 
            [accountTwo],// address[] memory participants,
            [Token2Instance.address],// address[] memory tokens,
            [200],// uint256[] memory minimums,
            10,// uint256 blockCount,
            1,// uint256 quorumCount,
            [accountTwo,accountTwo],// address[] memory swapFrom,
            [accountFourth,accountThree],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
            , { from: accountOne}
        );
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(escrowID,Token2Instance.address, { from: accountTwo });
      
        // now locked
        
        // trying to unlock
        // await EscrowContractInstance.unlock(escrowID, accountThree, Token2Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        // await EscrowContractInstance.unlock(escrowID, accountFourth, Token2Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlockAll(escrowID, {from: accountTwo});
        

        // withdraw
        await EscrowContractInstance.withdraw(escrowID, {from: accountFourth});
        await EscrowContractInstance.withdraw(escrowID, {from: accountThree});
        
        const accountFourthEndingToken2Balance = (await Token2Instance.balanceOf(accountFourth));
        const accountThreeEndingToken2Balance = (await Token2Instance.balanceOf(accountThree));
      
        assert.equal(
            (new BN(accountFourthEndingToken2Balance,10)).toString(16), 
            (100*decimals).toString(16), 
            'Wrong balance after swap for accountFourth'
        );

        assert.equal(
            (new BN(accountThreeEndingToken2Balance,10)).toString(16), 
            (100*decimals).toString(16), 
            'Wrong balance after swap for accountThree'
        );
        
    });


});
