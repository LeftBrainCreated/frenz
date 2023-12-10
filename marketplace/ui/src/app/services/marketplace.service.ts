import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { UiService } from './ui.service';
import { Subject } from 'rxjs';

const contract_json = require("../contract-abi/marketplace.json");
const CONTRACT_ADDRESS = '0x968C23A5C3033A8dfE74F4f777E563F16e1f216B';
const SHIB_CONTRACT_ADDRESS = '0x495eea66b0f8b636d441dc6a98d8f5c3d455c4c0';
const BONE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000001010';
const LOCALHOST_CHAIN_ID = 0;
const SHIBARIUM_CHAIN_ID = 2;
const ETHEREUM_CHAIN_ID = 1;
const GOERLI_CHAIN_ID = 3;

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService extends Web3Service {
  targetedChainId: number;

  constructor(
    uiService: UiService
  ) {
    super(CONTRACT_ADDRESS, contract_json, uiService);
    this.loadWeb3().then(() => {
      this.init(GOERLI_CHAIN_ID);
    });
  }
}
