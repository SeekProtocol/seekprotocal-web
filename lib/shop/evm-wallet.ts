import {PAYMENT_ASSETS, type PaymentAsset} from './payment-assets.ts';

export interface EthereumProvider {
  request(args:{method:string;params?:unknown[]}):Promise<unknown>;
  on?(event:string,listener:(value:unknown)=>void):void;
  removeListener?(event:string,listener:(value:unknown)=>void):void;
}
export const EVM_ADDRESS=/^0x[0-9a-f]{40}$/i;
export const EVM_HASH=/^0x[0-9a-f]{64}$/i;
export const isEvmAsset=(asset:PaymentAsset)=>asset==='BNB'||asset==='ETH';
export async function connectEvmWallet(provider:EthereumProvider) {
  const accounts=await provider.request({method:'eth_requestAccounts'});
  if(!Array.isArray(accounts)||typeof accounts[0]!=='string'||!EVM_ADDRESS.test(accounts[0]))throw new Error('wallet_unavailable');
  return accounts[0] as string;
}
export async function prepareEvmWallet(provider:EthereumProvider,asset:PaymentAsset,account:string) {
  if(!isEvmAsset(asset)||!EVM_ADDRESS.test(account))throw new Error('invalid_payment_wallet');
  const chainId=asset==='BNB'?'0x38':'0x1';
  if(await provider.request({method:'eth_chainId'})!==chainId) {
    try {await provider.request({method:'wallet_switchEthereumChain',params:[{chainId}]});}
    catch(error) {
      if(asset!=='BNB'||(error as {code?:number})?.code!==4902)throw error;
      await provider.request({method:'wallet_addEthereumChain',params:[{chainId,chainName:'BNB Smart Chain',
        nativeCurrency:{name:'BNB',symbol:'BNB',decimals:18},rpcUrls:['https://bsc-dataseed.bnbchain.org'],blockExplorerUrls:['https://bscscan.com']}]});
      await provider.request({method:'wallet_switchEthereumChain',params:[{chainId}]});
    }
  }
  const accounts=await provider.request({method:'eth_accounts'});
  if(await provider.request({method:'eth_chainId'})!==chainId||!Array.isArray(accounts)
    ||typeof accounts[0]!=='string'||accounts[0].toLowerCase()!==account.toLowerCase())throw new Error('wallet_changed');
}
export function buildEvmPayment(order:{asset:PaymentAsset;amount:bigint;reference:string;router?:string;chainId?:number},account:string) {
  if(!isEvmAsset(order.asset)||!EVM_ADDRESS.test(account)||!order.router||!EVM_ADDRESS.test(order.router)
    ||/^0x0+$/i.test(order.router)||!EVM_HASH.test(order.reference)||/^0x0+$/i.test(order.reference)
    ||order.chainId!==(order.asset==='BNB'?56:1)||order.amount<=BigInt(0)||order.amount>BigInt('9223372036854775807')
    ||PAYMENT_ASSETS[order.asset].decimals!==18)throw new Error('invalid_payment_order');
  // ABI pay(bytes32): pinned against the compiled contract fixture in tests.
  return {from:account,to:order.router,value:`0x${order.amount.toString(16)}`,data:`0x8609cad1${order.reference.slice(2)}`,
    chainId:`0x${order.chainId.toString(16)}`};
}
