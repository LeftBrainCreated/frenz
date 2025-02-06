import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { GlobalConstants } from 'src/app/app.component';
import { UiService } from 'services/ui.service';
import { Subject } from 'rxjs';
import { WalletProvider } from 'src/app/interfaces/walletProvider';
import { coinbaseWallet } from 'src/app/app.module';
import { ContractConnectService } from 'services/contract-connect.service';
import { ComponentArbiterService } from 'services/component-arbiter.service';
import { AuthService } from 'services/auth.service';


declare let window: any;
const Web3 = require('web3');

@Component({
  selector: 'app-web3-connect',
  templateUrl: './web3-connect.component.html',
  styleUrls: ['./web3-connect.component.scss']
})
export class Web3ConnectComponent implements OnInit {
  @Input() chainId: number;
  @Input() collection: string;
  @Input() iFrame?: boolean = false;
  @Input() hasWalletView: boolean = false;

  cbWallet: boolean = false;
  mmWallet: boolean = false;
  trustWallet: boolean = false;
  braveWallet: boolean = false;

  buttonText: string = "Connect";
  loading: boolean = false;
  selectedAddress = '';
  supportedWallet = false;
  userConnected: boolean = false;
  targetNetwork: any;
  validChain?: boolean;
  w3Provider: any;
  web3Loaded: boolean;
  walletConnected: boolean = false;
  connectedWallets: string[];
  walletSelectVisible: boolean = false;
  private _eth = window.ethereum;
  private web3 = new Web3();

  public isCreator: boolean = false;
  public invalidTargetChainObs = new Subject<any>();
  public web3AccountChanged = new Subject<any>();
  public web3NetworkChanged = new Subject<any>();

  constructor(
    private ui: UiService,
    private cc: ContractConnectService,
    private arbiter: ComponentArbiterService,
    private auth: AuthService
  ) {
    this.ui.loadingObs.subscribe((loadState) => {
      this.loading = loadState;
    })
  }

  async ngOnInit(): Promise<void> {
    await this.loadWeb3();

    this.arbiter.marketplaceReady$.subscribe(ready => {
      if (ready && this.web3Loaded) {
        this.checkForSessionWallet();
      }
    })
    this.targetNetwork = GlobalConstants.NETWORKS[this.chainId];
    this.setWalletProviders()

    this.ui.walletSelected.subscribe(async (res: WalletProvider) => {
      this.selectedAddress = res.selectedAddress;
      this.buttonText = `${this.selectedAddress.substring(0, 5)}....${this.selectedAddress.slice(-4)}`;

      this.web3.setProvider(this.w3Provider);

      if (this.w3Provider.isCoinbaseWallet) {
        this._eth = coinbaseWallet.makeWeb3Provider(
          GlobalConstants.NETWORKS[this.chainId].rpc[0],
          this.targetNetwork
        )
      }

      await this.w3Provider.enable();
      this.arbiter.markWalletAsConnected(res);

      const date = new Date();
      // 7 day expiration
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
      localStorage.setItem('frenzSelectedWallet', this.selectedAddress);
      localStorage.setItem('frenzWalletProvider', res.provider);
      this.userConnected = true;
    })


    this.validChain = (this.w3Provider && this.w3Provider.chainId) || (this._eth && this._eth.isTrust) ? (this._eth.chainId == this.targetNetwork.chainHex) || this.w3Provider.isTrust : undefined;
  }

  private async checkForSessionWallet() {
    let wa = localStorage.getItem('frenzSelectedWallet');
    let walletType = localStorage.getItem('frenzWalletProvider');
    let wp: WalletProvider;

    if (!walletType) {
      this.w3Provider = this.web3.givenProvider;
      if (this.w3Provider.isCoinbaseWallet) {
        walletType = 'isCoinbaseWallet';
      } else if (this.w3Provider.isMetaMask) {
        walletType = 'isMetaMask';
      } else if (this.w3Provider.isBraveWallet) {
        walletType = 'isBraveWallet';
      } else if (this.w3Provider.isTrust) {
        walletType = 'isTrust';
      }
    } else {
      this.w3Provider = this.provider(walletType as any);
    }

    this.w3Provider.internalChainId = this.chainId;
    let accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err: any) => {
        if (err.code === 4001) {
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
    // let account = accounts[0];


    if (wa && walletType) {
      if (accounts.find((a: string) => a == wa)) {
        wp = {
          selectedAddress: wa,
          chainId: this.chainId,
          provider: walletType,
          isCreator: await this.auth.isMarketplaceCreator(wa)
        };

        this.cc.walletProvider = this.w3Provider;
        await this.cc.triggerContractConnect.next(this.w3Provider);
        this.ui.walletSelected.next(wp);
      }
    }
  }

  async loadWeb3(): Promise<boolean> {
    if (window.ethereum) {
      await window.ethereum.enable;
      this.web3Loaded = true;
    } else {
      this.ui.snackBarObs.next('Non-Ethereum browser detected. You Should consider using Trust or Metamask Wallet!');
      return false;
    }

    window.ethereum.on('accountsChanged', (accounts: any) => {
      this.web3AccountChanged.next(accounts);
    });

    window.ethereum.on('chainChanged', (networkId: any) => {
      if (this.chainId != networkId || (window.ethereum && window.ethereum.isTrust)) {
        this.web3NetworkChanged.next(networkId);
      }
    });

    return true;
  }

  async connect(e: Event, walletType: any = null) {
    e.stopPropagation();
    this.ui.loadingBar(true);

    if (!walletType) {
      this.w3Provider = this.web3.givenProvider;
      if (this.w3Provider.isCoinbaseWallet) {
        walletType = 'isCoinbaseWallet';
      } else if (this.w3Provider.isMetaMask) {
        walletType = 'isMetaMask';
      } else if (this.w3Provider.isBraveWallet) {
        walletType = 'isBraveWallet';
      } else if (this.w3Provider.isTrust) {
        walletType = 'isTrust';
      }
    } else {
      this.w3Provider = this.provider(walletType);
    }

    this.w3Provider.internalChainId = this.chainId;

    if (this.w3Provider.isCoinbaseWallet) {
      this._eth = coinbaseWallet.makeWeb3Provider(
        GlobalConstants.NETWORKS[this.chainId].rpc[0],
        this.targetNetwork
      )
    }

    if (this.web3Loaded) {
      this.connectedWallets = [];
      let cw = await this.w3Provider.request({
        method: "eth_requestAccounts",
      });

      cw.forEach((wa: string) => {
        this.connectedWallets.push(`${wa}|${walletType}`);
      });
    }

    if (this.chainValidated() && this.w3Provider !== undefined) {
      if (this.selectedAddress == '') {
        await this.setWalletAddress(this.connectedWallets[0].split('|')[0], walletType);
      } else {
        this.walletSelectVisible = true;
      }
      this.cc.walletProvider = this.w3Provider;
      this.cc.triggerContractConnect.next(this.w3Provider);

      setTimeout(() => {
        this.walletSelectVisible = false;
      }, 8000)

      this.ui.loadingBar(false);
    } else {
      this.ui.loadingBar(false);
    }
  }

  goToWallet() {
    this.ui.navigateToTargetObs.next((4));
    this.walletSelectVisible = false;
  }

  selectNewWallet(address: string, provider: string) {
    this.walletSelectVisible = false;

    // this._eth.selectedAddress = address;
    this.setWalletAddress(address, provider);
  }

  public async requestProvider(manual: boolean = false) {
    if (!this.web3Loaded) {
      await this.loadWeb3();
    }

    if (this.web3Loaded) {
      this.connectedWallets = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
    }
  }

  /**
   * Returns an injected provider
   * @param walletType 'isMetaMask' | 'isCoinbaseWallet' | 'isTrust | isBraveWallet'
   * @returns Provider
   */
  private provider(walletType: 'isMetaMask' | 'isCoinbaseWallet | isTrust | isBraveWallet') {
    if (!window.ethereum) { throw new Error("No injected ethereum object."); }

    if (Array.isArray(window.ethereum.providers)) {
      const foundProvider = window.ethereum.providers.find((provider: any) => {
        return provider[walletType] === true;
      });

      // Return the found provider, or throw if not found
      if (foundProvider) {
        return foundProvider;
      } else {
        throw new Error(`Provider with ${walletType} not found.`);
      }
    } else {
      if (window.ethereum[walletType] === true) {
        return window.ethereum;
      } else {
        throw new Error(`Global provider does not match ${walletType}.`);
      }
    }
  }

  private async setWalletAddress(wa: string, provider: string) {
    this.selectedAddress = wa;
    this.ui.walletSelected.next({
      selectedAddress: wa,
      chainId: this.chainId,
      provider: provider,
      isCreator: await this.auth.isMarketplaceCreator(wa)
    })
  }

  private chainValidated(): boolean {
    this.validChain = undefined;
    // this.switchToTargetChain();

    if (this.w3Provider) {
      if (this.w3Provider.isTrust || (this.w3Provider.chainId == this.targetNetwork.chainHex)) {
        this.validChain = true
      } else {
        this.switchToTargetChain().then((res: any) => {
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

  public async switchToTargetChain() {
    var chainHex = GlobalConstants.NETWORKS[this.chainId].chainHex;

    return new Promise(async (res, rej) => {
      if (this.w3Provider.selectedAddress) {
        try {
          await this.w3Provider.request({
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

      await this.w3Provider.request({
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

  private setWalletProviders() {
    if (this.web3Loaded) {
      if (Array.isArray(this.web3.givenProvider.providers)) {
        // multiple wallets connected
        //coinbase
        this.cbWallet = this.web3.givenProvider.providers.some((p: any) => {
          return p.isCoinbaseWallet
        });

        //metamask
        this.mmWallet = this.web3.givenProvider.providers.some((p: any) => {
          return p.isMetaMask
        });

        //brave
        this.braveWallet = this.web3.givenProvider.providers.some((p: any) => {
          return p.isBraveWallet
        })

        //trust
        this.trustWallet = this.web3.givenProvider.providers.some((p: any) => {
          return p.isTrust
        });
      } else {
        let p = this.web3.givenProvider;

        if (p.isMetaMask) {
          this.mmWallet = true;
        } else if (p.Brave) {
          this.braveWallet = true;
        } else if (p.isTrust) {
          this.trustWallet = true;
        } else if (p.isCoinbaseWallet) {
          this.cbWallet = true;
        }
      }
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
