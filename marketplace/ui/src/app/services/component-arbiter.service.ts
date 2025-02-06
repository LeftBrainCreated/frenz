import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WalletProvider } from '../interfaces/walletProvider';

@Injectable({
  providedIn: 'root'
})
export class ComponentArbiterService {
  private marketplaceReady = new BehaviorSubject<boolean>(false);
  public marketplaceReady$ = this.marketplaceReady.asObservable();

  private walletConnected = new BehaviorSubject<WalletProvider>(null);
  public walletConnected$ = this.walletConnected.asObservable();

  constructor() { }

  markMarketplaceAsReady() {
    this.marketplaceReady.next(true);
  }

  markWalletAsConnected(wallet: WalletProvider) {
    this.walletConnected.next(wallet);
  }
}
