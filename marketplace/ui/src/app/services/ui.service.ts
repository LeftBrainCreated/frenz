import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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
  public backNavObs = new Subject<number>();

  constructor() { }
}
