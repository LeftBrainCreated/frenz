import { Injectable } from '@angular/core';
import { ContractService } from './contract.service';
import { UiService } from './ui.service';
import { ContractConnectService } from './contract-connect.service';

const OPERATING_CHAIN_ID: number = 3;

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
    try {
      const result = await this.callToContract("mintToken", [deliveryAddress, ipfsUri]);
      console.log(`Listing Created: DeliveredTo: ${deliveryAddress}`);
      return result;
    } catch (ex) {
      throw ex;
    }
  }
}
