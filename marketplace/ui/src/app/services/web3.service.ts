import { EventEmitter, Injectable, Output, Provider } from '@angular/core';
import { UiService } from './ui.service';
import { GlobalConstants } from 'src/app/app.component';
import { Subject } from 'rxjs';
// import * from '../../../node_modules/web3-utils'

const Web3 = require('web3');
import { ethers } from 'ethers';
import { Contract } from 'web3-eth-contract';
// import { JsonRpcProvider, ethers } from 'ethers';
import ERC20_ABI from "../contract-abi/ERC20.json";
import CREATOR_ABI_json from "../contract-abi/ERC721Creator.json";
import BEACON_ABI_json from '../contract-abi/BeaconProxy.json';
import { ContractConnectService } from './contract-connect.service';
import { WalletProvider } from '../interfaces/walletProvider';
import { Collection } from '../interfaces/collection';
// import { Interface } from 'alchemy-sdk/dist/src/api/utils';

declare let window: any;

// const CREATOR_ABI = new ethers.Interface(CREATOR_ABI_json.abi);
// const BEACON_ABI = new ethers.Interface(BEACON_ABI_json.abi);
// const IMPLEMENTATION_BYTECODE = CREATOR_ABI_json.data.bytecode.object;
// const BEACON_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100575760003560e01c80633659cfe61461005c5780635c60da1b14610071578063715018a61461009a5780638da5cb5b146100a2578063f2fde38b146100b3575b600080fd5b61006f61006a3660046102ee565b6100c6565b005b6001546001600160a01b03165b6040516001600160a01b03909116815260200160405180910390f35b61006f61010e565b6000546001600160a01b031661007e565b61006f6100c13660046102ee565b610122565b6100ce6101af565b6100d781610209565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b6101166101af565b610120600061029e565b565b61012a6101af565b6001600160a01b0381166101945760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084015b60405180910390fd5b61019d8161029e565b50565b6001600160a01b03163b151590565b6000546001600160a01b031633146101205760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161018b565b6001600160a01b0381163b61027c5760405162461bcd60e51b815260206004820152603360248201527f5570677261646561626c65426561636f6e3a20696d706c656d656e746174696f6044820152721b881a5cc81b9bdd08184818dbdb9d1c9858dd606a1b606482015260840161018b565b600180546001600160a01b0319166001600160a01b0392909216919091179055565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006020828403121561030057600080fd5b81356001600160a01b038116811461031757600080fd5b939250505056fea264697066735822122037f5e761a584b5cfedfedcacdd35de142872479851fbaecf66f55a175ffa1d1d64736f6c63430008090033";
// const COLLECTION_IMPLEMENTATION_ADDRESS = "0xF1Df2f7c11Aeda67922B56f979846598d3709389"
const BEACON_ADDRESS = '0x239C4c571bc8725245E554e5cf678a8508a71b53';

const BeaconProxyArtifact = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol/BeaconProxy.json');
// const UpgradableBeacon = require('@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol/UpgradeableBeacon.json');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  @Output()
  web3Connected: boolean;

  private contractAddress: string;
  private contractAbi: string;
  public web3: any;
  private chainId: number;
  private provider: any;

  public contract: any;
  public selectedAddress: string;
  public web3Loaded: boolean;
  public web3Loading: boolean;

  public invalidTargetChainObs = new Subject<any>();
  public web3AccountChanged = new Subject<any>();
  public web3NetworkChanged = new Subject<any>();
  public closeMintModal = new Subject<any>();
  public onLoadConnectObs = new Subject<string>();
  public walletAddressSelected = new Subject<string>();

  constructor(
    private ui: UiService,
    protected cc: ContractConnectService
  ) {
    this.loadWeb3();
  }

  public givenProvider(): any {
    return this.web3.givenProvider;
  }

  protected init(contractAddress: string, contractAbi: any, targetedChainId: number) {
    this.ui.walletSelected.subscribe((wallet: WalletProvider) => {
      this.selectedAddress = wallet.selectedAddress;
      this.chainId = wallet.chainId;
    })

    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
    this.chainId = targetedChainId;

    this.cc.triggerContractConnect.subscribe((w3Provider) => {
      this.contract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
      this.contract.setProvider(w3Provider);
    })
  }

  // public async disconnectWallet(): Promise<void> {
  //   await window.web3.eth.currentProvider.disconnect();
  // }

  public setProvider(w3Provider: any) {
    this.web3.setProvider(w3Provider);
  }

  public async connectWallet(manual: boolean = false) {
    if (!this.web3Loaded) {
      await this.loadWeb3()
        .then(async (res) => {
          if (res === true) {
            await window.ethereum.request({
              method: "eth_requestAccounts",
            }).then((res: string[]) => {
              if (manual) {
                this.web3Connected = true;
              } else {
                var wa = this.getCookie('frenzSelectedWallet');
                if (res.includes(wa)) {
                  this.selectedAddress = wa;
                  this.web3Connected = true;

                  this.onLoadConnectObs.next(wa);
                }
              }
            });

          }
        }).catch((err) => {
          if (err !== false) {
            console.log('error loading marketplace')
          } else {
            console.log('no wallet in browser');
          }
        });
    } else {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      }).then((res: string[]) => {
        if (manual) {
          // this.connectToContract();
          this.web3Connected = true;
        } else {
          var wa = this.getCookie('frenzSelectedWallet');
          if (res.includes(wa)) {
            this.selectedAddress = wa;
            // this.connectToContract();
            this.web3Connected = true;

            this.onLoadConnectObs.next(wa);
          }
        }
      });

    }

  }

  public async disconnectWallet(recoonect: boolean = false) {
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [
        {
          "eth_accounts": {}
        }
      ]
    }).then(() => {
      if (recoonect) {
        this.setSelectedAddress();
      }
    });
  }

  public async setSelectedAddress() {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    }).then((res: any) => {
      if (res.length == 0) {
        this.selectedAddress = window.ethereum.address;
      } else {
        this.selectedAddress = res[0];
      }
    })
  }

  async loadWeb3(): Promise<boolean> {
    this.web3Loading = true;
  
    if (!window.ethereum) {
      this.web3Loading = false;
      return Promise.reject(false);
    }
  
    try {
      this.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      this.web3Loaded = true;
  
      window.ethereum.on('accountsChanged', (accounts: any) => {
        this.web3AccountChanged.next(accounts);
      });
  
      window.ethereum.on('chainChanged', (networkId: any) => {
        if (this.chainId != networkId || (window.ethereum && window.ethereum.isTrust)) {
          this.web3NetworkChanged.next(networkId);
        }
      });
  
      this.web3Loading = false;
      return true;
    } catch (error) {
      console.error(error);
      this.web3Loading = false;
      return Promise.reject(false);
    }
  }

    public async callERC20(contractAddress: string, functionName: string, args: any[], gas: number = 5000000) {
    return new Promise((res, rej) => {
      var erc20 = new this.web3.eth.Contract(ERC20_ABI, contractAddress);

      erc20.methods[functionName](args)
        .call({
          from: this.selectedAddress,
          gas: gas
        })
        .then((result: string) => {
          res(result);
        })
        .catch((ex: any) => {
          console.log(ex);
        })
    });
  }

  public async getContractBalance(contractAddress: string) {
    return this.web3.eth.getBalance(contractAddress);
  }

  public getCookie(name: string) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");

    if (parts && parts.length == 2) {
      return parts.pop().split(";").shift();
    }

    return null;
  }

  public async checkForApproval(qty: number, spenderContractAddress: string, erc20ContractAddress: any): Promise<any> {

    var erc20Contract = new this.web3.eth.Contract(ERC20_ABI, erc20ContractAddress);
    return new Promise((res, rej) => {

      try {
        erc20Contract.methods
          .allowance(this.selectedAddress, spenderContractAddress)
          .call({
            from: this.selectedAddress,
            gas: 50000
          })
          .then((isApproved: string) => {
            if (Number(isApproved) >= qty) {
              res('approved');
            } else {
              res('');
            }
          })
      } catch (ex) {
        rej("Invalid Configuration");
      }
    });
  }

  public async approveTokenForTransfer(qty: string, spenderContractAddress: string, erc20ContractAddress: any) {

    var chain = GlobalConstants.NETWORKS[this.chainId];
    var erc20Contract = new this.web3.eth.Contract(ERC20_ABI, erc20ContractAddress);

    return new Promise((res, rej) => {
      erc20Contract.methods
        .approve(spenderContractAddress, qty)
        .send({
          from: this.selectedAddress,
          gas: 50000
        })
        .on('receipt', (receipt: any) => {
          this.ui.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${receipt.transactionHash}`);
          res({
            success: true,
            status: 'Success!',
            final: false
          })

        }).catch((ex: any) => {
          if (ex.code == 4001) {
            console.log('User Cancelled');
          } else {
            console.log("Approval Failure");
          }
          this.ui.loadingObs.next(false);
        })
    });
  }

  public async deployNewCollection(col: Collection): Promise<string> {
    try {
      const deployedAddress = await this.deployProxyContract(this.web3.givenProvider.selectedAddress);
      const erc721Creator = new this.web3.eth.Contract(CREATOR_ABI_json.abi, deployedAddress);

      await erc721Creator.methods.initialize(col.collectionName, col.symbol).send({
        from: this.web3.givenProvider.selectedAddress
      });

      return deployedAddress;
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  }

  private async deployProxyContract(fromAddress: string): Promise<string> {
    const BeaconProxy = new this.web3.eth.Contract(BeaconProxyArtifact.abi);

    const deployTx = BeaconProxy.deploy({
      data: BeaconProxyArtifact.bytecode,
      arguments: [BEACON_ADDRESS, "0x"]
    });

    const gas = await deployTx.estimateGas({ from: fromAddress });

    const newContractInstance = await deployTx.send({
      from: fromAddress,
      gas: gas
    });

    return newContractInstance.options.address;
  }
  private getInitializerData(contractInterface: ethers.Interface, args: any) {
    const fragment = contractInterface.getFunction('initialize');
    return contractInterface['encodeFunctionData'](fragment, args);
  }

  public async switchToTargetChain() {
    var chainHex = GlobalConstants.NETWORKS[this.chainId].chainHex;

    return new Promise(async (res, rej) => {
      if (window.ethereum.selectedAddress) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
              chainId: chainHex
            }]
          })

          res(true);
        } catch (err) {
          if (err.code !== 4902) {
            handleError(err);
          } else {
            await this.addTargetNetwork().then(() => {
              this.switchToTargetChain();
            }).catch((err) => {
              handleError(err);
            });
          }
        }
      } else {
        rej('not connected');
      }
    });
  }

  public async addTargetNetwork() {
    try {
      var chain = GlobalConstants.NETWORKS[this.chainId];

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chain.chainHex,
          chainName: chain.name,
          rpcUrls: chain.rpc,
          blockExplorerUrls: chain.explorer,
          nativeCurrency: chain.nativeCurrency
        }]
      });
    } catch (err) {
      console.log(err);
    }
  }

}

function handleError(err: any): unknown {
  if (err && typeof err === "object") {
    return {
      success: false,
      status: err.message,
    };
  } else {
    if (err.code !== 4001) {
      console.log('User Rejected Transaction');
      return {
        success: false,
        status: 'User Rejected Transaction',
      };
    }

    var err = err.message.substr(err.message.indexOf("'") + 1);
    err = JSON.parse(err.substr(0, err.length - 1));

    try {
      // console.log(`${err['value']['data']['message']}❗|${err['value']['data']['data']['txHash']}`);
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
