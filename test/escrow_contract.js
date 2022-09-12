const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');
const { expect } = require('chai');
const chai = require('chai');
const { time } = require('@openzeppelin/test-helpers');

const ZERO = BigNumber.from('0');
const ONE = BigNumber.from('1');
const TWO = BigNumber.from('2');
const THREE = BigNumber.from('3');
const FOUR = BigNumber.from('4');
const FIVE = BigNumber.from('5');
const SIX = BigNumber.from('6');
const SEVEN = BigNumber.from('7');
const TEN = BigNumber.from('10');
const HUN = BigNumber.from('100');

const ONE_ETH = ethers.utils.parseEther('1');    
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("EscrowContract", function () {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    
    const accounts = waffle.provider.getWallets();
    const owner = accounts[0];                     
    const alice = accounts[1];
    const bob = accounts[2];
    const charlie = accounts[3];



    var EscrowFactory;

    beforeEach("deploying", async() => {
        const EscrowFactoryF = await ethers.getContractFactory("EscrowFactory");
        EscrowFactory = await EscrowFactoryF.deploy();

    });
    describe("Validate parameters", function () {
        var Token1Instance, Token2Instance, ERC20MintableF;
        before("deploying", async() => {
            ERC20MintableF = await ethers.getContractFactory("ERC20Mintable");

            Token1Instance = await ERC20MintableF.deploy('t1','t1');
            Token2Instance = await ERC20MintableF.deploy('t2','t2');

            await Token1Instance.connect(owner).mint(alice.address , TWO.mul(HUN).mul(ONE_ETH));
            await Token2Instance.connect(owner).mint(bob.address , THREE.mul(HUN).mul(ONE_ETH));
                
        });

        it('while produce', async () => {
                
            await expect(
                EscrowFactory.connect(owner).produce(
                    [],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("Participants list can not be empty");

            
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("Tokens list can not be empty");
            
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("Minimums list can not be empty");
            
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("SwapFrom list can not be empty");
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("SwapTo list can not be empty");
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    555,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("Wrong quorumCount");
            
            await expect(
                EscrowFactory.connect(owner).produce(
                    [charlie.address,alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300,120,3230],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith("Parameters participants/tokens/minimums must be the same length");
            
            await expect(
                EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    50,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [charlie.address,alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                )
            ).to.be.revertedWith( "Parameters swapFrom/swapTo must be the same length");
            
        });
        describe("while deposit", function () {
            var EscrowContractInstance;
            before("deploying", async() => {

                
                let tx,rc,event,instance,instancesCount;
                //
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [TWO.mul(HUN).mul(ONE_ETH),THREE.mul(HUN).mul(ONE_ETH)],// uint256[] memory minimums,
                    HUN,// uint256 duration,
                    ONE,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);

            }); 

            it('"Such Escrow have already locked up" ', async () => {
                
                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO.mul(HUN).mul(ONE_ETH));
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
                
                await Token2Instance.connect(bob).approve(EscrowContractInstance.address,THREE.mul(HUN).mul(ONE_ETH));
                await expect(
                    EscrowContractInstance.connect(bob).deposit(Token2Instance.address),
                    "Such Escrow have already locked up"
                );
            });

            it('"Such participant does not exists in this escrow" ', async () => {
                
                await Token2Instance.connect(charlie).approve(EscrowContractInstance.address,THREE.mul(HUN).mul(ONE_ETH));
                await expect(
                    EscrowContractInstance.connect(charlie).deposit(Token2Instance.address),
                    "Such participant does not exists in this escrow"
                );
            });

            it('"Such token does not exists for this participant" ', async () => {
                let Token4Instance = await ERC20MintableF.deploy('t4','t4');

                await Token4Instance.connect(owner).mint(alice.address , TWO.mul(HUN).mul(ONE_ETH));

                await Token4Instance.connect(alice).approve(EscrowContractInstance.address,THREE.mul(HUN).mul(ONE_ETH));
                await expect(
                    EscrowContractInstance.connect(alice).deposit(Token4Instance.address),
                    "Such token does not exists for this participant"
                );
            });

            it('"Amount exceeds allowed balance" ', async () => {
                await expect(
                    EscrowContractInstance.connect(bob).deposit(Token2Instance.address),
                    "Amount exceeds allowed balance"
                );
            });


        });
        describe("while Unlock", function () {
            it('Escrow. Validate parameters. Unlock. "Such Escrow have not locked yet" ', async () => {
                
                let tx,rc,event,instance,instancesCount;
                //
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);

                
                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO.mul(HUN).mul(ONE_ETH));
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
                
                await expect(
                    EscrowContractInstance.connect(alice).unlock(alice.address, Token1Instance.address, TWO.mul(HUN).mul(ONE_ETH)),
                    "Such Escrow have not locked yet"
                );
            });
    
        });
    });
/*
    
    
    it('Escrow. Validate parameters. Unlock. "Such participant is not exists via recipient" ', async () => {
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address,bob.address],// address[] memory swapFrom,
            [alice.address,bob.address,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
        
        // now locked
        
        await expect(
            EscrowContractInstance.unlock( accountFourth, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        // and try to send to recipient from another pair
        await expect(
            EscrowContractInstance.unlock( accountFourth, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), { from: accountTwo }),
            "Such participant is not exists via recipient"
        );
        
    });
    
    it('Escrow. Validate parameters. Unlock. "Such participant does not exists in this escrow" ', async () => {
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountFive ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address,bob.address, accountFive],// address[] memory swapFrom,
            [alice.address,bob.address,accountFourth,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
        
        await expect(
            EscrowContractInstance.unlock( accountFourth, Token2Instance.address, '0x'+(300*decimals).toString(16), { from: accountFive }),
            "Such participant does not exists in this escrow"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Such token does not exists for this participant" ', async () => {
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address,bob.address],// address[] memory swapFrom,
            [alice.address,bob.address,accountFourth],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
        
        await expect(
            EscrowContractInstance.unlock( bob.address, Token2Instance.address, '0x'+(300*decimals).toString(16), { from: accountTwo }),
            "Such token does not exists for this participant"
        );
    });
    
    it('Escrow. Validate parameters. Unlock. "Amount exceeds balance available to unlock" ', async () => {
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address, accountFourth],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300,100],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address,bob.address, accountFourth],// address[] memory swapFrom,
            [alice.address,bob.address,accountFourth, alice.address],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
        
        await expect(
            EscrowContractInstance.unlock( alice.address, Token2Instance.address, '0x'+(300*decimals).toString(16), { from: accountFourth }),
            "Amount exceeds balance available to unlock"
        );
    });
    
    it('Escrow test(2 participants / 2 recipients / 2 tokens = full exchange)', async () => {
        
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address],// address[] memory swapFrom,
            [alice.address,bob.address],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
      
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( alice.address, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token1Instance.balanceOf(accountThree));
      
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
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address],// address[] memory swapFrom,
            [alice.address,bob.address],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
      
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( alice.address, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token1Instance.balanceOf(accountThree));
      
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
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address],// address[] memory swapFrom,
            [alice.address,bob.address],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
      
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( alice.address, Token2Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountThree});
      
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token1Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
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
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        const accountTwoToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            2,// uint256 quorumCount,
            [bob.address,alice.address],// address[] memory swapFrom,
            [alice.address,bob.address],// address[] memory swapTo,
            true// bool swapBackAfterEscrow
        , { from: accountOne});
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
      
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
      
        // now locked
        
        
        // trying to unlock
        await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( alice.address, Token2Instance.address, '0x'+BigNumber(150*decimals).toString(16), {from: accountThree});
        
        // pass 100 seconds. 
        await helper.advanceTime(100);
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountTwo});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountTwoEndingToken3Balance = (await Token2Instance.balanceOf(accountTwo));
        const accountThreeEndingToken2Balance = (await Token1Instance.balanceOf(accountThree));
        
        const accountTwoEndingToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token2Instance.balanceOf(accountThree));
        
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
        
        const Token1Instance = await ERC20Mintable.new('t2','t2');
        const Token2Instance = await ERC20Mintable.new('t3','t3');
        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountThree ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
        await Token1Instance.mint(accountFourth ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });
        await Token2Instance.mint(accountFive ,'0x'+BigNumber(300*decimals).toString(16), { from: accountOne });
    
        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address,bob.address,accountFourth,accountFive],// address[] memory participants,
            [Token1Instance.address, Token2Instance.address,Token1Instance.address, Token2Instance.address],// address[] memory tokens,
            [200,300,200,300],// uint256[] memory minimums,
            100,// uint256 duration,
            4,// uint256 quorumCount,
            [alice.address,bob.address,accountFourth,accountFive],// address[] memory swapFrom,
            [accountSix,accountSeven,accountSix,accountSeven],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
        , { from: accountOne}
        );
 
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountThree });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountThree });
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountFourth });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountFourth });
        
        await Token2Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(300*decimals).toString(16), { from: accountFive });
        await EscrowContractInstance.deposit(Token2Instance.address, { from: accountFive });
      
        // now locked
        
       
        // trying to unlock
        await EscrowContractInstance.unlock( accountSix, Token1Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlock( accountSeven, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountThree});
        await EscrowContractInstance.unlock( accountSix, Token1Instance.address, '0x'+BigNumber(200*decimals).toString(16), {from: accountFourth});
        await EscrowContractInstance.unlock( accountSeven, Token2Instance.address, '0x'+BigNumber(300*decimals).toString(16), {from: accountFive});
        
        // withdraw
        await EscrowContractInstance.withdraw( {from: accountSix});
        await EscrowContractInstance.withdraw( {from: accountSeven});
        
        const accountSixEndingToken2Balance = (await Token1Instance.balanceOf(accountSix));
        const accountSevenEndingToken3Balance = (await Token2Instance.balanceOf(accountSeven));
      
        const accountTwoEndingToken2Balance = (await Token1Instance.balanceOf(accountTwo));
        const accountThreeEndingToken3Balance = (await Token2Instance.balanceOf(accountThree));
        const accountFourthEndingToken2Balance = (await Token1Instance.balanceOf(accountFourth));
        const accountFiveEndingToken3Balance = (await Token2Instance.balanceOf(accountFive));
        
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
        
        const Token1Instance = await ERC20Mintable.new('t2','t2');

        var EscrowContractInstance;
        
        await Token1Instance.mint(accountTwo ,'0x'+BigNumber(200*decimals).toString(16), { from: accountOne });

        const accountTwoToken2Balance = (await Token1Instance.balanceOf(accountTwo));

        EscrowContractInstance = await EscrowContractMock.new({ from: accountOne});
        await EscrowContractInstance.init(
            [alice.address],// address[] memory participants,
            [Token1Instance.address],// address[] memory tokens,
            [200],// uint256[] memory minimums,
            10,// uint256 duration,
            1,// uint256 quorumCount,
            [alice.address, alice.address],// address[] memory swapFrom,
            [accountFourth, bob.address],// address[] memory swapTo,
            false// bool swapBackAfterEscrow
            , { from: accountOne}
        );
        
        await Token1Instance.approve(EscrowContractInstance.address,'0x'+BigNumber(200*decimals).toString(16), { from: accountTwo });
        await EscrowContractInstance.deposit(Token1Instance.address, { from: accountTwo });
      
        // now locked
        
        // trying to unlock
        // await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        // await EscrowContractInstance.unlock( accountFourth, Token1Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
        await EscrowContractInstance.unlockAll( {from: accountTwo});
        

        // withdraw
        await EscrowContractInstance.withdraw( {from: accountFourth});
        await EscrowContractInstance.withdraw( {from: accountThree});
        
        const accountFourthEndingToken2Balance = (await Token1Instance.balanceOf(accountFourth));
        const accountThreeEndingToken2Balance = (await Token1Instance.balanceOf(accountThree));
      
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
*/
});
