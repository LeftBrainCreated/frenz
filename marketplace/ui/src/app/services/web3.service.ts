import { EventEmitter, Injectable, Output } from '@angular/core';
import { UiService } from './ui.service';
import { GlobalConstants } from 'src/app/app.component';
import { Subject } from 'rxjs';
// import * from '../../../node_modules/web3-utils'

import Web3 from 'web3';
import ERC20_ABI from "../contract-abi/ERC20.json";
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export abstract class Web3Service {

  @Output()
  web3Connected: boolean;

  private contractAddress: string;
  private contractAbi: string;
  private web3: any;
  private chainId: number;

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

  constructor(contractAddress: string, contractAbi: string, private uiService: UiService) {
    this.contractAddress = contractAddress;
    this.contractAbi = contractAbi;
  }

  public init(targetedChainId: number) {
    this.chainId = targetedChainId;
    this.connectWallet();
    if (this.web3Loaded && window.ethereum) {
      this.selectedAddress = window.ethereum.address || window.ethereum.selectedAddress;
    }
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
                this.connectToContract();
                this.web3Connected = true;
              } else {
                var wa = this.getCookie('coOpSelectedWallet');
                if (res.includes(wa)) {
                  this.selectedAddress = wa;
                  this.connectToContract();
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
          this.connectToContract();
          this.web3Connected = true;
        } else {
          var wa = this.getCookie('coOpSelectedWallet');
          if (res.includes(wa)) {
            this.selectedAddress = wa;
            this.connectToContract();
            this.web3Connected = true;

            this.onLoadConnectObs.next(wa);
          }
        }
      });

    }

  }

  private connectToContract() {
    this.contract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
  }

  async loadWeb3(): Promise<boolean> {
    return new Promise(async (res, rej) => {
      this.web3Loading = true;
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable;
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
        res(true);
      } else {
        // window.alert('Non-Ethereum browser detected. You Should consider using Trust or Metamask Wallet!');
        this.web3Loading = false;
        rej(false);
      }
    })
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

  public async callToContract(functionName: string, args: any = [], gas: number = 500000) {
    return new Promise((res, rej) => {

      this.contract.methods[functionName](args)
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

  public async sendToContract(functionName: string, value: string = '0', args: any = null, gas: number = 500000) {
    return new Promise((res, rej) => {

      var call: any;
      var chain = GlobalConstants.NETWORKS[this.chainId];
      this.uiService.loadingObs.next(true);

      if (args == null) {
        call = this.contract.methods[functionName]();
      } else {
        call = this.contract.methods[functionName](args);
      }

      call.send({
        from: this.selectedAddress,
        value: value,
        gas: gas
      })
        .on('transactionHash', (id: string) => {
          if (id) {
            console.log('success');
            this.uiService.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${id}`);
          } else {
            console.log('success');
            console.log(id)
          }
        })
        .on('receipt', (receipt: any) => {
          this.uiService.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${receipt.transactionHash}`);
          res({
            success: receipt.status == true,
            detail: receipt
          });
          this.uiService.loadingObs.next(false);
        }).catch((ex: any) => {
          if (ex.code == 4001) {
            // user cancelled
            console.log("User Cancelled Transaction");
          } else {
            this.uiService.snackBarObs.next("Failure");
          }
          this.uiService.loadingObs.next(false);
          rej(ex);
        });
    });
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
          this.uiService.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${receipt.transactionHash}`);
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
          this.uiService.loadingObs.next(false);
        })
    });
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
