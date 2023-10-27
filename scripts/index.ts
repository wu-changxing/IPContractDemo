import Web3 from 'web3';
import { WebsocketProvider, Account } from 'web3-core';
import { deployContract } from './deploy';
import { handleRequestEvent } from './listen';
import { loadCompiledSols } from './load';
import { methodSend } from './send';
import { Contract } from 'web3-eth-contract';

let fs = require('fs');

function initializeProvider(): WebsocketProvider {
    try {
        let provider_data = fs.readFileSync('eth_providers/providers.json');
        let provider_json = JSON.parse(provider_data);
        let provider_link = provider_json["provider_link"];
        return new Web3.providers.WebsocketProvider(provider_link);
    } catch (error) {
        throw "Cannot read provider";
    }
}

function getAccount(web3: Web3, name: string): Account {
    try {
        let account_data = fs.readFileSync('eth_accounts/accounts.json');
        let account_json = JSON.parse(account_data);
        let account_pri_key = account_json[name]["pri_key"];
        return web3.eth.accounts.wallet.add('0x' + account_pri_key);
    } catch (error) {
        throw "Cannot read account";
    }
}

var shellArgs = process.argv.slice(2);
if (shellArgs.length < 1) {
    console.error("node programName cmd, e.g. node index.js deploy");
    process.exit(1);
}


(async function run() {
    let web3Provider!: WebsocketProvider;
    let web3!: Web3;
    try {
        web3Provider = initializeProvider();
        web3 = new Web3(web3Provider);
    } catch (e) {
        throw "web3 cannot be initialized";
    }

    var cmd0 = shellArgs[0];

    if (cmd0 == "deploy") {
        let account = getAccount(web3, "trusted_server");
        let loadedBookFactory = loadCompiledSols(["BookFactory"]);
        let bookfactory = await deployContract(web3!, account, loadedBookFactory.contracts["BookFactory"]["BookFactory"].abi, loadedBookFactory.contracts["BookFactory"]["BookFactory"].evm.bytecode.object, [account.address]);
        console.log("BookFactory contract address: " + bookfactory.options.address);
        let BookFactoryAddr = bookfactory.options.address;
        
        let loadedTransfer = loadCompiledSols(["BookFactory","Transfer"]);
        let transfer = await deployContract(web3!, account, loadedTransfer.contracts["Transfer"]["Transfer"].abi, loadedTransfer.contracts["Transfer"]["Transfer"].evm.bytecode.object, [BookFactoryAddr]);
        console.log("transfer contract address: " + transfer.options.address);
        let BookTransferAddr = transfer.options.address;

        let loaded = loadCompiledSols(["BookFactory","Transfer", "userapp"]);
        let contractapp = await deployContract(web3!, account, loaded.contracts["userapp"]["UserApp"].abi, loaded.contracts["userapp"]["UserApp"].evm.bytecode.object, [BookFactoryAddr,BookTransferAddr]);
        console.log("user app contract address: " + contractapp.options.address);
        let Appaddr = contractapp.options.address
        web3Provider.disconnect(1000, 'Normal Closure');
    } 
    else if (cmd0 == "listen") {
            let account!: Account;
            let contract!: Contract;
            try {
                let account = getAccount(web3, "trusted_server");
                let loadedBookFactory = loadCompiledSols(["BookFactory"]);
                let bookfactory = await deployContract(web3!, account, loadedBookFactory.contracts["BookFactory"]["BookFactory"].abi, loadedBookFactory.contracts["BookFactory"]["BookFactory"].evm.bytecode.object, [account.address]);
                console.log("BookFactory contract address: " + bookfactory.options.address);
                let BookFactoryAddr = bookfactory.options.address;
                
                let loadedTransfer = loadCompiledSols(["BookFactory","Transfer"]);
                let transfer = await deployContract(web3!, account, loadedTransfer.contracts["Transfer"]["Transfer"].abi, loadedTransfer.contracts["Transfer"]["Transfer"].evm.bytecode.object, [BookFactoryAddr]);
                console.log("transfer contract address: " + transfer.options.address);
                let BookTransferAddr = transfer.options.address;

                let loaded = loadCompiledSols(["BookFactory","Transfer", "userapp"]);
                let contractapp = await deployContract(web3!, account, loaded.contracts["userapp"]["UserApp"].abi, loaded.contracts["userapp"]["UserApp"].evm.bytecode.object, [BookFactoryAddr,BookTransferAddr]);
                console.log("user app contract address: " + contractapp.options.address);
                let Appaddr = contractapp.options.address

                contract = new web3.eth.Contract(loaded.contracts["userapp"]["UserApp"].abi,Appaddr , {});

            } catch (err) {
                console.error("error listening oracle contract");
                console.error(err);
            }
            handleRequestEvent(contract, async (caller: String, requestId: Number, data: any) => {
                let reqs = web3.eth.abi.decodeParameters(['string', 'string'], data);
                let req1 = reqs[0];
                let req2 = reqs[1];
                // let info1 = await grabBook(req1);
                // let info2 = await grabBook(req2);
                let info1 = 'reqa'
                let info2 = 'reqb'
                let infoHex1!: String;
                let infoHex2!: String;
                try {
                    infoHex1 = web3.utils.toHex(info1);
                    infoHex2 = web3.utils.toHex(info2);
                } catch (e) {
                    console.error("invalid info grabbed");
                    console.error(e);
                    return;
                }
                let infosHex = web3.eth.abi.encodeParameters(['string', 'string'], [infoHex1, infoHex2]);
                console.log("the info in " + req1 + " is " + info1);
                console.log("the info in " + req2 + " is " + info2);
                try {
                
                
                    console.log(infosHex)
                    let receipt = await methodSend(web3, account, contract.options.jsonInterface, "replyData(uint256,address,bytes)", contract.options.address, [requestId, caller, infosHex]);
                }
                catch(err){
                    console.log(err)
                }
            });
        }
})();