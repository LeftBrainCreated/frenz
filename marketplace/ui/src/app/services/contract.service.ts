import { Injectable } from '@angular/core';
import { UiService } from './ui.service';
import { GlobalConstants } from '../app.component';
import { Subject } from 'rxjs';
import Web3 from 'web3';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export abstract class ContractService {
  private chainId: number;
  public web3: Web3;

  public contract: any;
  public selectedAddress: string;
  public web3Loaded: boolean;
  public initialized: boolean;

  public invalidTargetChainObs = new Subject<any>();
  public web3AccountChanged = new Subject<any>();
  public web3NetworkChanged = new Subject<any>();
  public closeMintModal = new Subject<any>();
  public onLoadConnectObs = new Subject<string>();
  public walletAddressSelected = new Subject<string>();

  constructor(
    private uiService: UiService,
  ) {
    this.web3 = new Web3(window.ethereum);
  }

  public async initializeContract(address: string, abi: any) {
    this.contract = new this.web3.eth.Contract(abi, address);
    this.initialized = true;
  }

  public async callToContract(functionName: string, args: any = null, gas: number = 500000): Promise<any> {
    return new Promise((res, rej) => {
      if (!this.initialized) {
        rej('Contract Not Initialized');
      } else {
        var call: any;
        if (args == null) {
          call = this.contract.methods[functionName]();
        } else {
          call = this.contract.methods[functionName](args);
        }

        call.call({
          from: this.selectedAddress,
          gas: gas
        })
          .then((result: string) => {
            res(result);
          })
          .catch((ex: any) => {
            console.log(ex);
          })
      }
    });
  }

  public async sendToContract(functionName: string, value: string = '0', args: any = null, gas: number = 500000): Promise<any> {
    return new Promise((res, rej) => {
      if (!this.initialized) {
        rej('Contract Not Initialized');
      } else {
        var call: any;
        var chain = GlobalConstants.NETWORKS[this.chainId];
        this.uiService.loadingBar(true);

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
            this.uiService.loadingBar(false);
          }).catch((ex: any) => {
            if (ex.code == 4001) {
              // user cancelled
              console.log("User Cancelled Transaction");
            } else {
              this.uiService.snackBarObs.next("Failure");
            }
            this.uiService.loadingBar(false);
            rej(ex);
          });
      }
    });
  }
}
