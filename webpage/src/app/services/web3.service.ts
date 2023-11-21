import { Injectable, Output } from '@angular/core';
import type { Web3BaseProvider, AbiStruct, Address, ContractAbi } from 'web3-types'
import { Contract, Web3 } from 'web3';
import FLOW_FRENZ_ABI from '../FlowFrenz.abi.json'
import { Subject } from 'rxjs';

declare let window:any;


const MANIFOLD_CONTRACT_PARENT_ADDRESS = '0x1EB73FEE2090fB1C20105d5Ba887e3c3bA14a17E';
const CREATOR_CONTRACT_ADDRESS = '0xCC8a48A9129A12a500c798943faBF6259FCCc7a5';
const CONTRACT_INSTANCE_ID = '1032663280';
const PRICE = 0.1;
const bytes32 = require('bytes32');


var contract: any;


@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  web3: any;
  web3Loaded: boolean = false;

  @Output()
  web3Connected: boolean = false;

  @Output()
  chainId!: string;

  @Output()
  jwt!: string;

  selectedAddress = '';

  public invalidTargetChainObs =    new Subject<boolean>();
  public web3AccountChanged =       new Subject<any>();
  public web3NetworkChanged =       new Subject<string>();
  public closeMintModal =           new Subject<any>();
  public changeConnectedStateObs =  new Subject<boolean>();
  public initMintDialog =           new Subject<null>();

  public NULL_ADDRESS: string = "0x0000000000000000000000000000000000000000";

  constructor() { }

  // static gasMulptiplier = 1.2 // Increase by 20%

  // static gasPay(gasLimit: string) {
  //     return Math.ceil(Number(gasLimit) * this.gasMulptiplier).toString()
  // }

  async loadWeb3(): Promise<boolean> {
    if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable;
        this.web3Loaded = true;
    } else {
        // window.alert('Non-Ethereum browser detected. You Should consider using Trust or Metamask Wallet!');
        return false;
    }

    window.ethereum.on('accountsChanged',  (accounts: any) => {
      this.web3AccountChanged.next(accounts);
    });

    window.ethereum.on('chainChanged', (networkId: any) =>{
      if (this.chainId != networkId || (window.ethereum && window.ethereum.isTrust)) {
        this.web3NetworkChanged.next(networkId);
      }

      this.chainId = window.ethereum.chainId;
    });
  
    this.chainId = window.ethereum.chainId;

    // this.connectToContract();
    
    return true;
  }

  public async connectWallet() {
    if (this.web3Loaded && !this.web3Connected) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // this.connectToContract();
      this.web3Connected = true;
      // this.changeConnectedStateObs.next(true);
    }
  }

  public async disconnectWallet() {
    await window.web3.eth.currentProvider.disconnect();
  }

  public connectToContract() {
    contract = new this.web3.eth.Contract(FLOW_FRENZ_ABI, MANIFOLD_CONTRACT_PARENT_ADDRESS);
  }

  public async mintLicenseToken(qty: number) {
    return new Promise((resolve, rej) => {
  
      var walletAddress = window.ethereum.address || window.ethereum.selectedAddress;
      var functionName = 'mint';
      var fCall = contract.methods.mint(CREATOR_CONTRACT_ADDRESS, CONTRACT_INSTANCE_ID, 0, [], walletAddress);

      if (qty > 1) {
        functionName = 'mintBatch'
        var merkle: string[][] = [];
        var fCall = contract.methods.mintBatch(
          [CREATOR_CONTRACT_ADDRESS, CREATOR_CONTRACT_ADDRESS], 
          [parseInt(CONTRACT_INSTANCE_ID), parseInt(CONTRACT_INSTANCE_ID)], 
          [qty, qty], 
          [new Array(), new Array()], 
          [new Array(), new Array()], 
          [walletAddress, walletAddress]
          );
      }

      fCall
        .send({ 
          from: walletAddress,
          value: this.web3.utils.toWei(PRICE * qty, "ether"),
          gas: (300000 * 96 / 100).toString()
        })
        .on('transactionHash', (id: string) => { 
          this.web3.closeMintModal.next();

          if (id) {
            console.log('success');
              // setProgState(1);
          } else {
            console.log('success');
            console.log(id)
          }
          resolve({
            success: true,
            status: 'Success!',
          });
      })
      .catch(function(s: any) {
        console.log('error');

  
        resolve(handleError(s));
      });
    });
  }

  private _getContractInstance(withSigner = false, unchecked = false): Contract<ContractAbi> {
    const contract = window.ManifoldEthereumProvider.contractInstance(
      MANIFOLD_CONTRACT_PARENT_ADDRESS,
      FLOW_FRENZ_ABI,
      withSigner,
      unchecked
    );
    if (!contract) {
      throw new Error('No contract instance available, please refresh this page to try again');
    }
    return contract;
  }
}

function handleError(result: any): unknown {
  if (result && typeof result === "object") {
    return {
      success: false,
      status: result.message,
    };
  } else {
    var err = result.message.substr(result.message.indexOf("'") + 1);
    err = JSON.parse(err.substr(0, err.length - 1));

    try {
      return {
        success: false,
        status: `${err['value']['data']['message']}❗|${err['value']['data']['data']['txHash']}`,
      };
    } catch {
      return {
        success: false,
        status: 'Unknown Error',
      };
    }
  }

}

