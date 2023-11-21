import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Web3Service } from 'src/app/services/web3.service';
import { MatDialog } from '@angular/material/dialog';
import { MintDialogComponent } from '../mint-dialog/mint-dialog.component';

declare let window: any;

@Component({
  selector: 'app-web3',
  templateUrl: './web3.component.html',
  styleUrls: ['./web3.component.scss']
})
export class Web3Component implements OnInit {

  static readonly NETWORKS = [{
    name: "localhost"
    , chainHex: ""
  }, {
    name: "mainnet"
    , chainHex: "0x1"
  }]

  mintDialogOpen: boolean = false;
  buttonText: string = "Connect";
  // private _auth: TokenAuthService;
  targetNetwork = Web3Component.NETWORKS[1];
  validChain: boolean | undefined = undefined;
  supportedWallet = false;
  // petOwner: boolean;
  userConnected: boolean = false;

  constructor(
    public dialog: MatDialog
    , private web3: Web3Service
    , private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    setTimeout(() => {

      this.validChain = ((window.ethereum && window.ethereum.chainId) || (window.ethereum && window.ethereum.isTrust) ? (window.ethereum.chainId == this.targetNetwork.chainHex) || window.ethereum.isTrust : undefined) ?? false;
      this.prepWeb3();

    }, 200)

    this.web3.invalidTargetChainObs.subscribe((_res) => {
      // this.openChainDialog(res);
    });

    this.web3.web3AccountChanged.subscribe((_res) => {
      this.recoonect();
    })

    this.web3.web3NetworkChanged.subscribe((_res) => {
      // this.recoonect();
      this.validateChain();
      this.web3.changeConnectedStateObs.next(this.web3.web3Connected);
    })

    this.web3.initMintDialog.subscribe(() => {
      this.openMintDialog();
    })

    this.web3.changeConnectedStateObs.subscribe((connected: boolean) => {
      switch (connected) {
        case true:
          if (!this.validChain) {
            this.buttonText = 'Invalid Chain';
          } else {
            if (this.web3.selectedAddress) {
              this.web3.connectToContract();
              this.buttonText = this.web3.selectedAddress.substring(0, 6) + "....";
            }
            this.userConnected = true;
          }
          break;

        case false:
          this.buttonText = "Connect";
          this.userConnected = false;
          break;

        default:
          this.buttonText = "Connect";
          this.userConnected = false;

      }

      this.cdr.detectChanges();
    })
  }

  private recoonect() {
    var load = !this.web3.web3Loaded;
    var connect = !this.web3.web3Connected;

    if (load) {
      this.prepWeb3();
    }

    if (connect) {
      this.connect();
    }

    this.cdr.detectChanges();
  }

  private prepWeb3() {
    this.web3.loadWeb3().then((res) => {
      this.supportedWallet = res;
      this.validateChain();
    });
  }

  async mintFrenzNFT() {
    // this.uiService.loadingBar(true);
    if (this.web3.web3Connected && this.validChain) {
      new Promise((_res, rej) => {

        _res(this.openMintDialog());

      }).catch((err) => {
        console.log(err.message);
        this.failMint('There was an error minting your PET token');
      });
    }
  }

  async connect() {
    if (!this.web3.web3Connected) {
      this.buttonText = "Checking...";
      await this.web3.connectWallet();
    }

    if (window.ethereum !== undefined) {
      this.web3.selectedAddress = window.ethereum.address || window.ethereum.selectedAddress;

      if (this.validateChain() === true) {

        if (this.web3.web3Connected) {
          this.web3.connectToContract();
          this.buttonText = this.web3.selectedAddress.substring(0, 6) + "....";
        } else if (this.web3.web3Loaded) {
          this.buttonText = "Authenticate";
        } else {
          this.buttonText = "Connect";
        }

      } else {
        this.buttonText = "Invalid Chain"
      }

    }

    this.web3.changeConnectedStateObs.next(this.web3.web3Connected);
  }

  private validateChain(): boolean {
    this.validChain = false;

    if (window.ethereum) {
      if (window.ethereum.isTrust || (window.ethereum.chainId == this.targetNetwork.chainHex)) {
        this.validChain = true
      }
    }

    this.web3.invalidTargetChainObs.next(!this.validChain);
    this.cdr.detectChanges();

    return this.validChain;
  }

  private failMint(message: string) {
    console.log('Mint Error');
    // this.uiService.snackBarObs.next(message);
    // this.uiService.loadingBar(false);
  }


  private openMintDialog(): void {
    if (this.web3.web3Connected && this.validChain) {
      if (!this.mintDialogOpen) {

        const dialogRef = this.dialog.open(MintDialogComponent, {
          data: { walletAddress: this.web3.selectedAddress },
        });

        dialogRef.afterClosed().subscribe(result => {
          this.mintDialogOpen = false;
          // this.uiService.loadingBar(false);
        });

        this.mintDialogOpen = true;
      }
    }
  }

}
