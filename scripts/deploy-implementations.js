const fs = require('fs');
//const HDWalletProvider = require('truffle-hdwallet-provider');

function get_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.readFile('./scripts/arguments.json', (err, data) => {
            if (err) {
				
                if (err.code == 'ENOENT' && err.syscall == 'open' && err.errno == -4058) {
                    fs.writeFile('./scripts/arguments.json', "", (err2) => {
                        if (err2) throw err2;
                        resolve();
                    });
                    data = ""
                } else {
                    throw err;
                }
            }
    
            resolve(data);
        });
    });
}

function write_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.writeFile('./scripts/arguments.json', _message, (err) => {
            if (err) throw err;
            console.log('Data written to file');
            resolve();
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function main() {
	var data = await get_data();

    var data_object_root = JSON.parse(data);
	var data_object = {};
	if (typeof data_object_root[hre.network.name] === 'undefined') {
        data_object.time_created = Date.now()
    } else {
        data_object = data_object_root[hre.network.name];
    }
	//----------------

	const networkName = hre.network.name;

    var depl_local,
    depl_auxiliary,
    depl_releasemanager,
    depl_escrow;

    var signers = await ethers.getSigners();
    if (networkName == 'hardhat') {
        depl_local = signers[0];
        depl_auxiliary = signers[0];
        depl_releasemanager = signers[0];
        depl_escrow = signers[0];
    } else {
        [
            depl_local,
            depl_auxiliary,
            depl_releasemanager,
            depl_escrow
        ] = signers;
    }

    const RELEASE_MANAGER = process.env.RELEASE_MANAGER; //hre.network.name == 'mumbai'? process.env.RELEASE_MANAGER_MUMBAI : process.env.RELEASE_MANAGER;

	console.log(
		"Deploying contracts with the account:",
		depl_auxiliary.address
	);

	// var options = {
	// 	//gasPrice: ethers.utils.parseUnits('50', 'gwei'), 
	// 	gasLimit: 10e6
	// };

    const deployerBalanceBefore = await ethers.provider.getBalance(depl_auxiliary.address);
    console.log("Account balance:", (deployerBalanceBefore).toString());

	const EscrowContractF = await ethers.getContractFactory("EscrowContract");

	let implementationEscrowContract = await EscrowContractF.connect(depl_auxiliary).deploy();
    
    await implementationEscrowContract.waitForDeployment();

	console.log("Implementations:");
	console.log("  EscrowContract deployed at:       ", implementationEscrowContract.target);

	data_object.implementationEscrowContract 	= implementationEscrowContract.target;
    data_object.releaseManager                  = RELEASE_MANAGER;

	const deployerBalanceAfter = await ethers.provider.getBalance(depl_auxiliary.address);
	console.log("Spent:", ethers.formatEther(deployerBalanceBefore - deployerBalanceAfter));
    console.log("gasPrice:", ethers.formatUnits((await network.provider.send("eth_gasPrice")), "gwei")," gwei");

	//---
	const ts_updated = Date.now();
    data_object.time_updated = ts_updated;
    data_object_root[`${hre.network.name}`] = data_object;
    data_object_root.time_updated = ts_updated;
    let data_to_write = JSON.stringify(data_object_root, null, 2);
    await write_data(data_to_write);
    
    if (networkName == 'hardhat') {
        console.log("skipping verifying for  'hardhat' network");
    } else {
        console.log('waiting 3 sec');
        await sleep(3000);
        console.log("Starting verifying:");
        await hre.run("verify:verify", {address: implementationEscrowContract.target, contract: 'contracts/EscrowContract.sol:EscrowContract'});
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });