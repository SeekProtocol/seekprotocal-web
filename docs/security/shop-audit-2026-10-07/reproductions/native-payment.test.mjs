import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ganache from 'ganache';
import solc from 'solc';
import {BrowserProvider,ContractFactory,id} from 'ethers';
import {compile} from './compile.mjs';
const artifact=compile();
test('checked-in ABI, bytecode and selectors exactly match pinned source/compiler',()=>{
 assert.deepEqual(artifact,JSON.parse(fs.readFileSync(new URL('../functions/_shared/shop-evm-contract.json',import.meta.url))));
});
for(const chainId of [1,56])test(`native payment forwards exact wei on chain ${chainId}, and failed transfers never emit receipts`,async()=>{
 const rpc=ganache.provider({chain:{chainId},logging:{quiet:true}});
 try {
 const provider=new BrowserProvider(rpc),signer=await provider.getSigner();
 const treasury='0xd55f3e07ee55f3644a93E26E569fF7e0Ea193de8';
 const payment=await new ContractFactory(artifact.abi,artifact.bytecode,signer).deploy(treasury);await payment.waitForDeployment();
 const address=await payment.getAddress();
 assert.equal((await provider.getCode(address)).toLowerCase(),artifact.runtime.toLowerCase());
 assert.equal(await payment.treasury(),treasury);
 const amount=100000000000000001n,reference=id(`order-${chainId}`);
 const receipt=await (await payment.pay(reference,{value:amount})).wait();
 assert.equal(BigInt(await rpc.request({method:'eth_getBalance',params:[treasury,'latest']})),amount);
 assert.equal(receipt.logs.length,1);
 const event=payment.interface.parseLog(receipt.logs[0]);
 assert.equal(event.args[0],reference);assert.equal(event.args[1],await signer.getAddress());assert.equal(event.args[2],amount);
 await assert.rejects(()=>payment.pay('0x'+'0'.repeat(64),{value:1n}));
 await assert.rejects(()=>payment.pay(reference,{value:0n}));
 await assert.rejects(()=>signer.sendTransaction({to:address,value:1n}));
 // A treasury that refuses funds causes the entire payment to revert.
 const rejectingSource='pragma solidity 0.8.30; contract Reject {receive() external payable {revert();}}';
 const rejected=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'r.sol':{content:rejectingSource}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}}))).contracts['r.sol'].Reject;
 const reject=await new ContractFactory(rejected.abi,rejected.evm.bytecode.object,signer).deploy();await reject.waitForDeployment();
 const bad=await new ContractFactory(artifact.abi,artifact.bytecode,signer).deploy(await reject.getAddress());await bad.waitForDeployment();
 await assert.rejects(()=>bad.pay(reference,{value:amount}));
 assert.equal(BigInt(await rpc.request({method:'eth_getBalance',params:[await bad.getAddress(),'latest']})),0n);
 } finally {await rpc.disconnect();}
});
test('audit: any payer can emit 101 valid receipts for one reference in one transaction',async()=>{
 const rpc=ganache.provider({chain:{chainId:1},logging:{quiet:true}});
 try{
 const provider=new BrowserProvider(rpc),signer=await provider.getSigner();
 const treasury='0xd55f3e07ee55f3644a93E26E569fF7e0Ea193de8';
 const payment=await new ContractFactory(artifact.abi,artifact.bytecode,signer).deploy(treasury);await payment.waitForDeployment();
 const source='pragma solidity 0.8.30; interface P { function pay(bytes32) external payable; } contract Batch { function payMany(address target, bytes32 ref) external payable { require(msg.value==101); for(uint i=0;i<101;i++) P(target).pay{value:1}(ref); } }';
 const result=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'batch.sol':{content:source}},settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}}))).contracts['batch.sol'].Batch;
 const batch=await new ContractFactory(result.abi,result.evm.bytecode.object,signer).deploy();await batch.waitForDeployment();
 const reference=id('audit-victim-reference');
 const receipt=await (await batch.payMany(await payment.getAddress(),reference,{value:101n,gasLimit:5000000n})).wait();
 assert.equal(receipt.logs.length,101);
 assert.equal(BigInt(await rpc.request({method:'eth_getBalance',params:[treasury,'latest']})),101n);
 for(const log of receipt.logs){const event=payment.interface.parseLog(log);assert.equal(event.args[0],reference);assert.equal(event.args[2],1n)}
 console.log('101 genuine Payment logs in one transaction; gas used: '+receipt.gasUsed);
 }finally{await rpc.disconnect()}
});
