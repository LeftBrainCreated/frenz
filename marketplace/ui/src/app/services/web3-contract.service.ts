import { Injectable, Output } from '@angular/core';
import { UiService } from './ui.service';
import { GlobalConstants } from 'src/app/app.component';
import { Subject } from 'rxjs';
import { WalletProvider } from '../interfaces/walletProvider';
import Web3 from 'web3';
import { ContractConnectService } from './contract-connect.service';

const ERC20_ABI = require("../contract-abi/ERC20.json");
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export abstract class Web3ContractService {
  // @Output()
  // contractConnected: boolean;

  private contractAbi: any;
  protected chainId: number;
  protected web3 = new Web3(window.ethereum);

  public contractAddress: string;
  public contract: any;
  public selectedAddress: string;
  public iFrame: boolean = false;

  public closeMintModal = new Subject<any>();

  constructor(
    private ui: UiService,
    protected cc: ContractConnectService
  ) {

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

  private async setProviderForContract() {
      
    this.contract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
  
    if (this.web3.givenProvider._state.isConnected) {
      this.chainId = GlobalConstants.NETWORKS.findIndex((n) => n.chainHex == this.web3.givenProvider.chainId);
    }
  }
  
  public async callERC20(contractAddress: string, functionName: string, args: any[], gas: number = 5000000): Promise<any> {
    return new Promise((res, rej) => {
      var erc20 = new this.web3.eth.Contract(ERC20_ABI.abi, contractAddress);

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

  public async callToContract(functionName: string, args: any = null): Promise<any> {
    try {
      if (!this.contract) {
        await this.setProviderForContract();
      }
  
      const method = args == null
        ? this.contract.methods[functionName]()
        : this.contract.methods[functionName](...this.parameterSafe(args));
  
      return await method.call({ from: this.selectedAddress });
    } catch (ex) {
      console.error(ex);
      throw ex; // Rethrow the exception to allow the caller of the function to handle it
    }
  }

  public async sendToContract(functionName: string, value: string = '0', args: any = null, gas: number = 500000) {
    return new Promise(async (res, rej) => {

      if (!this.contract) {
        await this.setProviderForContract();
      }

      var call: any;
      var chain = GlobalConstants.NETWORKS[this.chainId];

      if (args == null) {
        call = this.contract.methods[functionName]();
      } else {
        call = this.contract.methods[functionName](...this.parameterSafe(args));
      }

      call.send({
        from: this.selectedAddress,
        value: value
      })
        .on('transactionHash', (id: string) => {
          if (id) {
            console.log('success');
            this.ui.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${id}`);
          } else {
            console.log('success');
            console.log(id)
          }
        })
        .on('receipt', (receipt: any) => {
          this.ui.snackBarObs.next(`Transaction Hash: ${chain.explorer[0]}/${receipt.transactionHash}`);
          res({
            success: receipt.status == true,
            detail: receipt
          });
          this.ui.loadingBar(false);
        }).catch((ex: any) => {
          if (ex.code == 4001) {
            // user cancelled
            console.log("User Cancelled Transaction");
          } else {
            this.ui.snackBarObs.next("Failure");
          }
          this.ui.loadingBar(false);
          rej(ex);
        });
    });
  }

  public triggerQtyObs(val: number) {
    this.ui.royaltyCheckObs.next(val);
  }

  public popUpResult(msg: string) {
    this.ui.mintResultObs.next(msg);
  }

  public async checkForApproval(qty: number, spenderContractAddress: string, erc20ContractAddress: any): Promise<any> {

    var erc20Contract = new this.web3.eth.Contract(ERC20_ABI.abi, erc20ContractAddress);
    return new Promise(async (res, rej) => {

      if (!this.contract) {
        await this.setProviderForContract();
      }

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
    var erc20Contract = new this.web3.eth.Contract(ERC20_ABI.abi, erc20ContractAddress);

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
          this.ui.loadingBar(false);
        })
    });
  }


  private parameterSafe(args: any) {
    return (Array.isArray(args) ? args : [args])
  }

}

