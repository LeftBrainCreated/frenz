import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Breadcrumb } from '../interfaces/breadcrumb';
import { WalletProvider } from '../interfaces/walletProvider';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public loadingObs = new Subject<boolean>();
  public snackBarObs = new Subject<any>();

  public scaleObjectObs = new Subject<boolean>();
  public switchViewModeObs = new Subject<boolean>();
  public walletAddressObs = new Subject<string>();
  public changeConnectedStateObs = new Subject<boolean>();
  public enterMarketplaceObs = new Subject<any>();
  public royaltyCheckObs = new Subject<number>();
  public mintResultObs = new Subject<string>();
  public BreadcrumbPushObs = new Subject<Breadcrumb[]>();
  public BreadcrumbPopObs = new Subject<Breadcrumb>();
  public walletSelected = new Subject<WalletProvider>();
  public CaptureBreadcrumbObs = new Subject<any>();
  public moveToWalletObs = new Subject<any>();
  public UiChangesObs = new Subject<void>();
  public navigateToTargetObs = new Subject<number>();
  public newMintModalOpenObs = new Subject<boolean>();

  public breadcrumbTrail: Breadcrumb[] = [];

  constructor() { }

  public pushToBreadcrumb(crumb: Breadcrumb): void {
    this.breadcrumbTrail.push(crumb);
    this.BreadcrumbPushObs.next(this.breadcrumbTrail);
    console.log(JSON.stringify(this.breadcrumbTrail));
  }

  public popBreadcrumb(): void {
    var bc = this.breadcrumbTrail.pop();
    this.BreadcrumbPopObs.next(bc);
    console.log(JSON.stringify(this.breadcrumbTrail));
  }

  public clearBreadcrumb(): void {
    this.breadcrumbTrail = [];
  }

  loadingBar(isLoading: boolean) {
    this.loadingObs.next(isLoading);
  }
}
