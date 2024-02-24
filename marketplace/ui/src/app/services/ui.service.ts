import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Breadcrumb } from '../interfaces/breadcrumb';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public loadingObs = new Subject<boolean>();
  public snackBarObs = new Subject<string>();

  public scaleObjectObs = new Subject<boolean>();
  public switchViewModeObs = new Subject<boolean>();
  public walletAddressObs = new Subject<string>();
  public changeConnectedStateObs = new Subject<boolean>();
  public enterMarketplaceObs = new Subject<any>();
  public BreadcrumbPushObs = new Subject<Breadcrumb[]>();
  public BreadcrumbPopObs = new Subject<Breadcrumb>();
  public CaptureBreadcrumbObs = new Subject<any>();
  public moveToWalletObs = new Subject<any>();
  public UiChangesObs = new Subject<void>();

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
