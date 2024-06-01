import { Injectable } from '@angular/core';
import { ContractService } from './contract.service';
import { UiService } from './ui.service';
import { ContractConnectService } from './contract-connect.service';

const OPERATING_CHAIN_ID: number = 2;

@Injectable({
  providedIn: 'root'
})
export class Erc721Service extends ContractService {

  constructor(
    ui: UiService,
    cc: ContractConnectService
  ) {
    super(ui, cc);
  }

  public async initContract(contractAddress: string, abi: any, selectedAddress: string = null) {
    if (selectedAddress) {
      this.selectedAddress = selectedAddress;
    }
    // tokenContractAddress = contractAddress;
    this.init(contractAddress, abi, OPERATING_CHAIN_ID);
  }

  public async createAsset(deliveryAddress: string, ipfsUri: string): Promise<any> {
    return new Promise(async (res, rej) => {
      await this.callToContract("mintToken", [
        deliveryAddress, ipfsUri,
      ]).then((result) => {
        console.log(`Listing Created: DeliveredTo: ${deliveryAddress}`);
        res(result);
      }).catch((ex) => {
        rej(ex);
      })
    })
  }
}
