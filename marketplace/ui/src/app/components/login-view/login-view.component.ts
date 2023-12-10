import { Component, Input } from '@angular/core';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss']
})
export class LoginViewComponent {

  @Input() mobileView: boolean = false;

  // _mp_web3: MarketplaceService;

  constructor(
    private ui: UiService
  ) {
    // this._mp_web3 = mp_web3;
  }

  @Input() targetChainId: number;

  enterMarketplace(): void {
    this.ui.enterMarketplaceObs.next(true);
  }
}
