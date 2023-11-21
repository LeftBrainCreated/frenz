import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Web3Service } from 'services/web3.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { UtilService } from 'services/util.service';

export interface DialogData {
  walletAddress: string
}

@Component({
  selector: 'app-mint-dialog',
  templateUrl: './mint-dialog.component.html',
  styleUrls: ['./mint-dialog.component.scss']
})

export class MintDialogComponent implements OnInit {

    qty: number = 1;
    ethToUsdRate: number = 0;
    erc20ToUsdRate: number = 0;
    erc20Address: string = '';
    erc20Symbol: string = 'ETH';

    constructor(
      public dialogRef: MatDialogRef<MintDialogComponent>,
      @Inject(MAT_DIALOG_DATA) 
      public data: DialogData,
      private web3: Web3Service,
      private util: UtilService
    ) {
      this.web3.closeMintModal.subscribe(() => {
        this.dialogRef.close();
       })
    }
  
    async ngOnInit(): Promise<void> {
      // console.log(JSON.stringify(this.data));
      // setInterval(this._setPriceRates, 30000);
      this.ethToUsdRate = (await this.util.getEthToUsdRate()) ?? 0;
      if (this.data.walletAddress !== this.web3.NULL_ADDRESS) {
        this.erc20ToUsdRate = (await this.util.getERC20ToUSDRate(this.erc20Symbol)) ?? 0;
      }
    }
  
    async onMintClick(): Promise<void> {
      if (!this.web3.web3Connected) {
        await this.web3.connectWallet();
      }
      this.web3.mintLicenseToken(this.qty);
      this.dialogRef.close();
    }

    disconnect(): void {
      this.web3.disconnectWallet();
    }

    qtyUp(): void {
      if (this.qty < 5) {
        this.qty++;
      }
    }

    qtyDown(): void {
      if (this.qty > 1) {
        this.qty--;
      }
    }
  
    async _setPriceRates() {
      this.ethToUsdRate = (await this.util.getEthToUsdRate()) ?? 0;
      if (this.data.walletAddress !== this.web3.NULL_ADDRESS) {
        this.erc20ToUsdRate = (await this.util.getERC20ToUSDRate(this.erc20Symbol)) ?? 0;
      }
    }
  

  }