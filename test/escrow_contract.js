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
    const dave = accounts[4];
    const mallory = accounts[5];
    const trudy = accounts[6];


    var EscrowFactory;
    
    const TWO_HUNDRED_TOKENS = TWO.mul(HUN).mul(ONE_ETH);           //200
    const THREE_HUNDRED_TOKENS = THREE.mul(HUN).mul(ONE_ETH);       //300
    const ONE_HUNDRED_FIFTY_TOKENS = THREE_HUNDRED_TOKENS.div(TWO); //150
    var Token1Instance, Token2Instance, ERC20MintableF;
    var EscrowContractInstance;
    var tx,rc,event,instance,instancesCount;
    
    before("deploying", async() => {
        const EscrowFactoryF = await ethers.getContractFactory("EscrowFactory");
        const EscrowContractF = await ethers.getContractFactory("EscrowContract");

        let implEscrowContract = await EscrowContractF.deploy();
        EscrowFactory = await EscrowFactoryF.deploy(implEscrowContract.address);

        ERC20MintableF = await ethers.getContractFactory("ERC20Mintable");

        Token1Instance = await ERC20MintableF.deploy('t1','t1');
        Token2Instance = await ERC20MintableF.deploy('t2','t2');
        
    });
    beforeEach("deploying", async() => {
        // @dev note that in each `decribe` section we will increase balance tokens for Bob, Alice, Charlie and Dave. 
        // We put it here just for avoiding copy-paste code in each `it` section
        await Token1Instance.connect(owner).mint(alice.address, TWO_HUNDRED_TOKENS);
        await Token2Instance.connect(owner).mint(bob.address, THREE_HUNDRED_TOKENS);
        await Token1Instance.connect(owner).mint(charlie.address, TWO_HUNDRED_TOKENS);
        await Token2Instance.connect(owner).mint(dave.address, THREE_HUNDRED_TOKENS);
    });
    describe("Validate parameters", function () {
        
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
            
            before("deploying", async() => {
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [TWO_HUNDRED_TOKENS,THREE_HUNDRED_TOKENS],// uint256[] memory minimums,
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

            
            //
            it('EscrowFactory.instancesCount', async () => {
                expect(await EscrowFactory.instancesCount()).to.be.eq(ONE);
            }); 

            it('"Such Escrow have already locked up" ', async () => {

                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
                
                await Token2Instance.connect(bob).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
                await expect(
                    EscrowContractInstance.connect(bob).deposit(Token2Instance.address),
                    "Such Escrow have already locked up"
                );
                
            });

            it('"Such participant does not exists in this escrow" ', async () => {
                
                await Token2Instance.connect(charlie).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
                await expect(
                    EscrowContractInstance.connect(charlie).deposit(Token2Instance.address),
                    "Such participant does not exists in this escrow"
                );
            });

            it('"Such token does not exists for this participant" ', async () => {
                let Token4Instance = await ERC20MintableF.deploy('t4','t4');

                await Token4Instance.connect(owner).mint(alice.address , TWO_HUNDRED_TOKENS);

                await Token4Instance.connect(alice).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
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
            
            it('"Such Escrow have not locked yet"', async () => {
                
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

                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

                await expect(
                    EscrowContractInstance.connect(alice).unlock(alice.address, Token1Instance.address, TWO_HUNDRED_TOKENS),
                    "Such Escrow have not locked yet"
                );
            });

            it('"Such participant is not exists via recipient"', async () => {
                
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address,bob.address],// address[] memory swapFrom,
                    [alice.address,bob.address,charlie.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);
                
                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
                
                await Token2Instance.connect(bob).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                
                // now locked
                await expect(
                    EscrowContractInstance.connect(alice).unlock(charlie.address, Token1Instance.address, TWO_HUNDRED_TOKENS),
                    "Such participant is not exists via recipient"
                );
                // and try to send to recipient from another pair
                await expect(
                    EscrowContractInstance.connect(alice).unlock(charlie.address, Token2Instance.address, THREE_HUNDRED_TOKENS),
                    "Such participant is not exists via recipient"
                );
                
            });
            
            it('"Such participant does not exists in this escrow"', async () => {
                
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address, bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address, alice.address, bob.address, dave.address],// address[] memory swapFrom,
                    [alice.address, bob.address, charlie.address, charlie.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);
                
                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

                await Token2Instance.connect(bob).approve(EscrowContractInstance.address, THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                
                await expect(
                    EscrowContractInstance.connect(dave).unlock(charlie.address, Token2Instance.address, THREE_HUNDRED_TOKENS),
                    "Such participant does not exists in this escrow"
                );
            });
            
            it('"Such token does not exists for this participant"', async () => {
                
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address, bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200, 300],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address, alice.address ,bob.address],// address[] memory swapFrom,
                    [alice.address, bob.address, charlie.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);
                
                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

                await Token2Instance.connect(bob).approve(EscrowContractInstance.address, THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                
                await expect(
                    EscrowContractInstance.connect(alice).unlock( bob.address, Token2Instance.address, THREE_HUNDRED_TOKENS),
                    "Such token does not exists for this participant"
                );
            });
            
            it('"Amount exceeds balance available to unlock" ', async () => {
                
                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address,bob.address, charlie.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200, 300, 100],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address, alice.address, bob.address, charlie.address],// address[] memory swapFrom,
                    [alice.address, bob.address, charlie.address, alice.address],// address[] memory swapTo,
                    false// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);

                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

                await Token2Instance.connect(bob).approve(EscrowContractInstance.address, THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                
                await expect(
                    EscrowContractInstance.connect(charlie).unlock(alice.address, Token2Instance.address, THREE_HUNDRED_TOKENS),
                    "Amount exceeds balance available to unlock"
                );
            });

        });
    });

    describe("Tests", function () {
        it('should withdraw own tokens before escrow have locked up', async () => {
            const aliceToken1Balance = (await Token1Instance.balanceOf(alice.address));
            // const aliceToken2Balance = (await Token2Instance.balanceOf(alice.address));
            // const bobToken1Balance = (await Token1Instance.balanceOf(bob.address));
            // const bobToken2Balance = (await Token2Instance.balanceOf(bob.address));

            tx = await EscrowFactory.connect(owner).produce(
                [alice.address, bob.address],// address[] memory participants,
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

            await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

            const aliceEndingToken1Balance = (await Token1Instance.balanceOf(alice.address));
            expect(aliceToken1Balance.sub(aliceEndingToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS);

            // quorum not exceed and duration have not passed. so we will try to with draw own tokens
            await EscrowContractInstance.connect(alice).withdraw();
            const aliceEndingAfterToken1Balance = (await Token1Instance.balanceOf(alice.address));

            
            expect(aliceToken1Balance).to.be.eq(aliceEndingAfterToken1Balance);
        });
        it('Escrow test(4 participants / 2 recipients / 2 tokens = full exchange)', async () => {


            const aliceToken1Balance    = await Token1Instance.balanceOf(alice.address);
            const aliceToken2Balance    = await Token2Instance.balanceOf(alice.address);
            const bobToken1Balance      = await Token1Instance.balanceOf(bob.address);
            const bobToken2Balance      = await Token2Instance.balanceOf(bob.address);
            const charlieToken1Balance  = await Token1Instance.balanceOf(charlie.address);
            const charlieToken2Balance  = await Token2Instance.balanceOf(charlie.address);
            const daveToken1Balance     = await Token1Instance.balanceOf(dave.address);
            const daveToken2Balance     = await Token2Instance.balanceOf(dave.address);
            const malloryToken1Balance  = await Token1Instance.balanceOf(mallory.address);
            const malloryToken2Balance  = await Token2Instance.balanceOf(mallory.address);
            const trudyToken1Balance    = await Token1Instance.balanceOf(trudy.address);
            const trudyToken2Balance    = await Token2Instance.balanceOf(trudy.address);
            
            tx = await EscrowFactory.connect(owner).produce(
                [alice.address, bob.address, charlie.address, dave.address],// address[] memory participants,
                [Token1Instance.address, Token2Instance.address,Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                [200,300,200,300],// uint256[] memory minimums,
                100,// uint256 duration,
                4,// uint256 quorumCount,
                [alice.address,bob.address,charlie.address,dave.address],// address[] memory swapFrom,
                [mallory.address,trudy.address,mallory.address,trudy.address],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
            );
            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceCreated');
            [instance, instancesCount] = event.args;
            EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);

            await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);

            await Token2Instance.connect(bob).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);

            await Token1Instance.connect(charlie).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(charlie).deposit(Token1Instance.address);

            await Token2Instance.connect(dave).approve(EscrowContractInstance.address,THREE_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(dave).deposit(Token2Instance.address);
            // now locked
            
        
            // trying to unlock
            await EscrowContractInstance.connect(alice).unlock(mallory.address, Token1Instance.address, TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(bob).unlock(trudy.address, Token2Instance.address, THREE_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(charlie).unlock(mallory.address, Token1Instance.address, TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(dave).unlock(trudy.address, Token2Instance.address, THREE_HUNDRED_TOKENS);
            
            // withdraw
            await EscrowContractInstance.connect(mallory).withdraw();
            await EscrowContractInstance.connect(trudy).withdraw();
            
            const aliceEndingToken1Balance  = await Token1Instance.balanceOf(alice.address);
            const aliceEndingToken2Balance  = await Token2Instance.balanceOf(alice.address);
            const bobEndingToken1Balance    = await Token1Instance.balanceOf(bob.address);
            const bobEndingToken2Balance    = await Token2Instance.balanceOf(bob.address);
            const charlieEndingToken1Balance= await Token1Instance.balanceOf(charlie.address);
            const charlieEndingToken2Balance= await Token2Instance.balanceOf(charlie.address);
            const daveEndingToken1Balance   = await Token1Instance.balanceOf(dave.address);
            const daveEndingToken2Balance   = await Token2Instance.balanceOf(dave.address);
            const malloryEndingToken1Balance= await Token1Instance.balanceOf(mallory.address);
            const malloryEndingToken2Balance= await Token2Instance.balanceOf(mallory.address);
            const trudyEndingToken1Balance  = await Token1Instance.balanceOf(trudy.address);
            const trudyEndingToken2Balance  = await Token2Instance.balanceOf(trudy.address);
            
            expect(aliceToken1Balance.sub(aliceEndingToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS); // 'Wrong balance after swap for Alice'
            expect(bobToken2Balance.sub(bobEndingToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS); // 'Wrong balance after swap for Bob'
            expect(charlieToken1Balance.sub(charlieEndingToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS); // 'Wrong balance after swap for Charlie'
            expect(daveToken2Balance.sub(daveEndingToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS); // 'Wrong balance after swap for Dave'
            
            expect(malloryEndingToken1Balance.sub(malloryToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS.add(TWO_HUNDRED_TOKENS)); // 'Wrong balance after swap for Mallory'
            expect(trudyEndingToken2Balance.sub(trudyToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS.add(THREE_HUNDRED_TOKENS)); // 'Wrong balance after swap for Mallory'
            
        });

        it('Escrow test(1 participant / 2 recipients(fifty-fifty) / 1 tokens = full exchange)', async () => {
            
            const aliceToken1Balance    = await Token1Instance.balanceOf(alice.address);
            const bobToken1Balance      = await Token1Instance.balanceOf(bob.address);
            const charlieToken1Balance  = await Token1Instance.balanceOf(charlie.address);
            
            tx = await EscrowFactory.connect(owner).produce(
                [alice.address],// address[] memory participants,
                [Token1Instance.address],// address[] memory tokens,
                [200],// uint256[] memory minimums,
                10,// uint256 duration,
                1,// uint256 quorumCount,
                [alice.address, alice.address],// address[] memory swapFrom,
                [charlie.address, bob.address],// address[] memory swapTo,
                false// bool swapBackAfterEscrow
            );
            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceCreated');
            [instance, instancesCount] = event.args;
            EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);
            
            await Token1Instance.connect(alice).approve(EscrowContractInstance.address, TWO_HUNDRED_TOKENS);
            await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
        
            // now locked
            
            // trying to unlock
            // await EscrowContractInstance.unlock( bob.address, Token1Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
            // await EscrowContractInstance.unlock( charlie, Token1Instance.address, '0x'+(100*decimals).toString(16), {from: accountTwo});
            await EscrowContractInstance.connect(alice).unlockAll();
            
            // withdraw
            await EscrowContractInstance.connect(charlie).withdraw();
            await EscrowContractInstance.connect(bob).withdraw();
            
            const aliceEndingToken1Balance  = await Token1Instance.balanceOf(alice.address);
            const bobEndingToken1Balance    = await Token1Instance.balanceOf(bob.address);
            const charlieEndingToken1Balance= await Token1Instance.balanceOf(charlie.address);

            expect(aliceToken1Balance.sub(aliceEndingToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS); // 'Wrong balance after swap for Alice'
            expect(charlieEndingToken1Balance.sub(charlieToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS.div(TWO)); // 'Wrong balance after swap for Charlie'
            expect(bobEndingToken1Balance.sub(bobToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS.div(TWO)); //'Wrong balance after swap for Bob'
        });

        describe("2 participants / 2 recipients / 2 tokens. swapBackAfterEscrow(false)", function () {
        
            beforeEach("prepare", async() => {
                aliceToken1Balance = (await Token1Instance.balanceOf(alice.address));
                aliceToken2Balance = (await Token2Instance.balanceOf(alice.address));
                bobToken1Balance = (await Token1Instance.balanceOf(bob.address));
                bobToken2Balance = (await Token2Instance.balanceOf(bob.address));

                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address, bob.address],// address[] memory participants,
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

                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
            
                await Token2Instance.connect(bob).approve(EscrowContractInstance.address, THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                // now locked
            });

            describe("(full exchange)", function () {
                beforeEach("trying to unlock", async() => {
                    // trying to unlock
                    await EscrowContractInstance.connect(alice).unlock(bob.address, Token1Instance.address, TWO_HUNDRED_TOKENS);
                    await EscrowContractInstance.connect(bob).unlock(alice.address, Token2Instance.address, THREE_HUNDRED_TOKENS);
                });

                it("full exchange", async () => {
                    
                    // withdraw
                    await EscrowContractInstance.connect(alice).withdraw();
                    await EscrowContractInstance.connect(bob).withdraw();
                    
                    const aliceEndingToken2Balance = await Token2Instance.balanceOf(alice.address);
                    const bobEndingToken1Balance = await Token1Instance.balanceOf(bob.address);

                    expect(aliceEndingToken2Balance.sub(aliceToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS); // else 'Wrong balance after swap for Alice'
                    expect(bobEndingToken1Balance.sub(bobToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS); // else 'Wrong balance after swap for Bob'
                    
                });

                it('full exchange (withdraw after escrow expired)', async () => {
        
                    // pass 100 seconds. 
                    await network.provider.send("evm_increaseTime", [100]);
                    await network.provider.send("evm_mine");
                    
                    // withdraw
                    await EscrowContractInstance.connect(alice).withdraw();
                    await EscrowContractInstance.connect(bob).withdraw();
                    
                    const aliceEndingToken2Balance = (await Token2Instance.balanceOf(alice.address));
                    const bobEndingToken1Balance = (await Token1Instance.balanceOf(bob.address));

                    expect(aliceEndingToken2Balance.sub(aliceToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS); // else 'Wrong balance after swap for Alice'
                    expect(bobEndingToken1Balance.sub(bobToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS); // else 'Wrong balance after swap for Bob'
                });
            });
        });
        describe("2 participants / 2 recipients / 2 tokens. swapBackAfterEscrow(true)", function () {
            
            beforeEach("SwapBackAfterEscrow(true)", async() => {
            
                aliceToken1Balance = (await Token1Instance.balanceOf(alice.address));
                aliceToken2Balance = (await Token2Instance.balanceOf(alice.address));
                bobToken1Balance = (await Token1Instance.balanceOf(bob.address));
                bobToken2Balance = (await Token2Instance.balanceOf(bob.address));

                tx = await EscrowFactory.connect(owner).produce(
                    [alice.address, bob.address],// address[] memory participants,
                    [Token1Instance.address, Token2Instance.address],// address[] memory tokens,
                    [200,300],// uint256[] memory minimums,
                    100,// uint256 duration,
                    2,// uint256 quorumCount,
                    [bob.address,alice.address],// address[] memory swapFrom,
                    [alice.address,bob.address],// address[] memory swapTo,
                    true// bool swapBackAfterEscrow
                );
                rc = await tx.wait(); // 0ms, as tx is already confirmed
                event = rc.events.find(event => event.event === 'InstanceCreated');
                [instance, instancesCount] = event.args;
                EscrowContractInstance = await ethers.getContractAt("EscrowContract",instance);


                await Token1Instance.connect(alice).approve(EscrowContractInstance.address,TWO_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(alice).deposit(Token1Instance.address);
            
                await Token2Instance.connect(bob).approve(EscrowContractInstance.address, THREE_HUNDRED_TOKENS);
                await EscrowContractInstance.connect(bob).deposit(Token2Instance.address);
                // now locked

                // trying to unlock
                await EscrowContractInstance.connect(alice).unlock(bob.address, Token1Instance.address, ONE_HUNDRED_FIFTY_TOKENS);
                await EscrowContractInstance.connect(bob).unlock(alice.address, Token2Instance.address, ONE_HUNDRED_FIFTY_TOKENS);

            });
            
            it("partly exchange", async () => {

                // withdraw
                await EscrowContractInstance.connect(alice).withdraw();
                await EscrowContractInstance.connect(bob).withdraw();
                
                const aliceEndingToken2Balance = (await Token2Instance.balanceOf(alice.address));
                const bobEndingToken1Balance = (await Token1Instance.balanceOf(bob.address));
                
                const aliceEndingToken1Balance = (await Token1Instance.balanceOf(alice.address));
                const bobEndingToken2Balance = (await Token2Instance.balanceOf(bob.address));
 
                // after swap
                expect(aliceEndingToken2Balance.sub(aliceToken2Balance)).to.be.eq(ONE_HUNDRED_FIFTY_TOKENS); //'Wrong balance after swap for Alice'
                expect(bobEndingToken1Balance.sub(bobToken1Balance)).to.be.eq(ONE_HUNDRED_FIFTY_TOKENS); //'Wrong balance after swap for Ищи'
                
                // left tokens does not return, because time is not passed
                expect(aliceToken1Balance.sub(aliceEndingToken1Balance)).to.be.eq(TWO_HUNDRED_TOKENS);
                expect(bobToken2Balance.sub(bobEndingToken2Balance)).to.be.eq(THREE_HUNDRED_TOKENS);
                

            });

            it("partly exchange (withdraw after escrow expired)", async () => {
                
                // pass 100 seconds. 
                await network.provider.send("evm_increaseTime", [100]);
                await network.provider.send("evm_mine");
                
                // withdraw
                await EscrowContractInstance.connect(alice).withdraw();
                await EscrowContractInstance.connect(bob).withdraw();
                
                const aliceEndingToken1Balance = (await Token1Instance.balanceOf(alice.address));
                const aliceEndingToken2Balance = (await Token2Instance.balanceOf(alice.address));

                const bobEndingToken1Balance = (await Token1Instance.balanceOf(bob.address));
                const bobEndingToken2Balance = (await Token2Instance.balanceOf(bob.address));

                // after swap
                expect(aliceEndingToken2Balance.sub(aliceToken2Balance)).to.be.eq(ONE_HUNDRED_FIFTY_TOKENS); //'Wrong balance after swap for Alice'
                expect(bobEndingToken1Balance.sub(bobToken1Balance)).to.be.eq(ONE_HUNDRED_FIFTY_TOKENS); //'Wrong balance after swap for Bob'
                
                // left after withdraw own. because swapBackAfterEscrow eq true, all own tokens have returned
                expect(aliceToken1Balance.sub(ONE_HUNDRED_FIFTY_TOKENS)).to.be.eq(aliceEndingToken1Balance);
                expect(bobToken2Balance.sub(ONE_HUNDRED_FIFTY_TOKENS)).to.be.eq(bobEndingToken2Balance);
            });
        });
    });
    
});
