import { Component, Input } from '@angular/core';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss']
})
export class LoginViewComponent {

  // _mp_web3: MarketplaceService;

  constructor(
    // mp_web3: MarketplaceService
  ) {
    // this._mp_web3 = mp_web3;
  }

  @Input() targetChainId: number;
}
