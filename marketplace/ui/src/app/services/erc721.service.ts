import { Injectable } from '@angular/core';
import { ContractService } from './contract.service';
import { UiService } from './ui.service';

@Injectable({
  providedIn: 'root'
})
export class Erc721Service extends ContractService {

  constructor(
    ui: UiService
  ) {
    super(ui);
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
