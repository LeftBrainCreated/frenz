import { Component, Input } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Web3Service } from 'src/app/services/web3.service';
import { GlobalConstants } from 'src/app/app.component';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { AlchemyService } from 'src/app/services/alchemy.service';
import Web3 from 'web3';

declare let window: any;

@Component({
  selector: 'app-wallet-connect-header',
  templateUrl: './wallet-connect-header.component.html',
  styleUrls: ['./wallet-connect-header.component.scss']
})
export class WalletConnectHeaderComponent {
  @Input() blockChainId: number;

  buttonText: string = "Connect";
  loading: boolean = false;
  selectedAddress = '';
  supportedWallet = false;
  petOwner: boolean;
  userConnected: boolean = false;
  targetNetwork: any;
  validChain?: boolean;


  constructor(
    private uiService: UiService
    , private web3: MarketplaceService
    , private alchemy: AlchemyService
  ) { }

  ngOnInit(): void {
    this.targetNetwork = GlobalConstants.NETWORKS[this.blockChainId];
    // this.web3.targetedChainId = this.blockChainId;
    this.validChain = (window.ethereum && window.eth_chainId) || (window.ethereum && window.ethereum.isTrust) ? (window.eth_chainId == this.targetNetwork.chainHex) || window.ethereum.isTrust : undefined;

    if (!this.web3.web3Loading) {
      this.prepWeb3();
    }

    this.uiService.walletAddressObs.subscribe((res) => {
      this.buttonText = res.substring(0, 5) + "...." + res.substring(res.length - 5);
    })

    this.uiService.loadingObs.subscribe((res: boolean) => {
      this.loading = res;
    })

    this.uiService.changeConnectedStateObs.subscribe((res: boolean) => {
      this.userConnected = res;
    })

    this.web3.invalidTargetChainObs.subscribe((_res) => {
      // this.openChainDialog(res);
    });

    this.web3.web3AccountChanged.subscribe((_res) => {
      this.recoonect();

    })

    this.web3.web3NetworkChanged.subscribe((_res) => {
      this.recoonect();
    })

    this.web3.onLoadConnectObs.subscribe((res) => {
      this.connect(true);
      // this.buttonText = this.web3.selectedAddress.substring(0, 5) + "....";
      // this._auth.emitAuthComplete(true);
      // this.uiService.walletAddressObs.next(this.web3.selectedAddress);
    })
  }

  private async recoonect() {
    var load = this.web3.web3Loaded;
    var connect = this.web3.web3Connected;
    this.web3.selectedAddress = undefined;

    if (load) {
      this.prepWeb3();

      if (connect) {
        await this.connect(true);
        await this.alchemy.getNFTsForWallet(this.web3.selectedAddress);
        this.web3.UiChangesObs.next();
      }
    }
  }

  private prepWeb3() {
    this.web3.loadWeb3().then((res) => {
      this.supportedWallet = res;

      if (window.eth_chainId != this.targetNetwork.chainHex) {
        this.web3.switchToTargetChain()
          .then((res) => {
            console.log('Switch Chain Successful');
          })
          .catch((ex) => {
            if (ex != "not connected") {
              console.log(ex);
            }
          })
          ;
      }
    }).catch((ex) => {
      if (ex !== false) {
        console.log(ex);
      }
    });
  }

  async openWalletSelection() {

    this.web3.disconnectWallet(true);

    // await window.ethereum.request({
    //   method: "disconnectWallet"
    // }).then(async function () {
    //   await window.ethereum.request({
    //     method: "requestAccounts",
    //   }).then((res) => {
    //     console.log(res);
    //     // if (res.length == 0) {
    //     //   this.selectedAddress = window.ethereum.address;
    //     // } else {
    //     //   this.selectedAddress = res[0];
    //     // }
    //   })
    // })

    // // this.web3.web3.givenProvider
    // //   .requestAccounts().then(console.log)

  }

  async connect(w3Connect: boolean = false, navigation = false) {
    if (this.userConnected && navigation) {
      // navigate to wallet view
      this.uiService.CaptureBreadcrumbObs.next(null);
      this.uiService.moveToWalletObs.next(null);
    } else {
      this.uiService.loadingObs.next(true);
      if (w3Connect && !this.web3.web3Connected) {
        this.buttonText = "Checking...";
        await this.web3.connectWallet(true);
      }

      if (w3Connect && this.chainValidated() === true) {
        if (window.ethereum !== undefined) {
          if (this.web3.selectedAddress == undefined) {
            await this.web3.setSelectedAddress();
          }
          if (this.web3.ownedAssets.length == 0) {
            this.alchemy.getNFTsForWallet(this.web3.selectedAddress);
          }
          // this.web3.selectedAddress = window.ethereum.address || window.ethereum.selectedAddress;
          // this.uiService.adminWalletObs.next(this.adminWalletAddress.includes(this.web3.selectedAddress.toLowerCase()));

          new Promise((_res, _rej) => {
            if (this.web3.web3Connected) {
              this.buttonText = this.web3.selectedAddress.substring(0, 5) + "....";
              this.uiService.walletAddressObs.next(this.web3.selectedAddress);
              this.uiService.changeConnectedStateObs.next(true);


            } else if (this.web3.web3Loaded) {
              this.buttonText = "Authenticate";
            } else {
              this.buttonText = "Connect";
            }
            this.uiService.loadingObs.next(false);
          }).catch((_err) => {
            console.log('Connect Error');
            this.uiService.loadingObs.next(false);
          });
        }
      } else {
        this.uiService.loadingObs.next(false);
      }
    }
  }

  private chainValidated(): boolean {
    this.validChain = undefined;

    if (window.ethereum) {
      if (window.ethereum.isTrust || (window.eth_chainId == this.targetNetwork.chainHex)) {
        this.validChain = true
      } else {
        this.web3.switchToTargetChain().then((res: any) => {
          this.validChain = res;
        }).catch((err) => {
          if (err != 'not connected') {
            console.log(err);
          }

        });

      }
    }

    return true;
  }

}
