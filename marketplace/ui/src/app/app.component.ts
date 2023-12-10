import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { distinctUntilChanged, tap } from 'rxjs';
import { UiService } from './services/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'flowfrenz-marketplace';
  breakpoint$: any;
  mobileView: boolean = false;
  blockerVisible: boolean = true;
  targetChainId: number = 3;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private uiService: UiService
  ) {
    this.breakpoint$ = this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, '(min-width: 500px)'])
      .pipe(
        // tap(value => console.log(value)),
        distinctUntilChanged()
      );
  }

  async ngOnInit(): Promise<void> {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );

    this.uiService.changeConnectedStateObs.subscribe((res: boolean) => {
      this.blockerVisible = !res;
    })

    this.uiService.enterMarketplaceObs.subscribe(() => {
      this.blockerVisible = false;
    })
  }

  private breakpointChanged() {
    if (this.breakpointObserver.isMatched(Breakpoints.TabletPortrait)) {
      this.mobileView = true;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.mobileView = true;
    } else if (this.breakpointObserver.isMatched(Breakpoints.HandsetLandscape)) {
      this.mobileView = true;
    } else if (this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait)) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }
}

export class GlobalConstants {
  static readonly HTTP_NOT_FOUND = '404';
  static readonly HTTP_INTERNAL_ERROR = '500';
  static readonly NETWORKS = [{
    name: "localhost"
    , chainHex: "0x7a69"
    , rpc: ['http://127.0.0.1:8545/']
    , explorer: []
    , nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    }
  }, {
    name: "MainNet"
    , chainHex: "0x1"
    , rpc: ['https://mainnet.infura.io/v3/']
    , explorer: ['https://etherscan.io']
    , nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    }
  }, {
    name: "Shibarium"
    , chainHex: "0x6d"
    , rpc: ['https://www.shibrpc.com', 'https://rpc.shibrpc.com']
    , explorer: ['https://shibariumscan.io']
    , nativeCurrency: {
      symbol: 'BONE',
      decimals: 18
    }
  }, {
    name: "Goerli"
    , "chainHex": "0x5"
    , rpc: ['https://ethereum-goerli.publicnode.com']
    , explorer: ['https://goerli.etherscan.io/']
    , symbol: 'ETH'
    , decimals: 18
  }]
};

