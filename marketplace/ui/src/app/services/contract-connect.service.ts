import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractConnectService {
  public triggerContractConnect = new Subject<any>();
  public walletProvider: any;

  constructor() { }
}
