import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MaterialModule } from './material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BabylonComponent } from './components/babylon/babylon.component';
import "@babylonjs/loaders/glTF";
import { CollectionPreviewComponent } from './components/collection-preview/collection-preview.component';
import { ViewToggleComponent } from './components/view-toggle/view-toggle.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { FooterBarComponent } from './components/footer-bar/footer-bar.component';
import { SingleCardComponent } from './components/single-card/single-card.component';
import { CompactListViewComponent } from './components/compact-list-view/compact-list-view.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AssetDetailViewComponent } from './components/asset-detail-view/asset-detail-view.component';
import { AssetPreviewComponent } from './components/asset-preview/asset-preview.component';
import { HttpClientModule } from '@angular/common/http';
import { TrackVisibilityDirective } from './directives/track-visibility.directive';
import { TraitComponent } from './components/trait/trait.component';
import { AboutDropdownComponent } from './components/about-dropdown/about-dropdown.component';
import { ContractDetailsComponent } from './components/contract-details/contract-details.component';
import { WalletConnectComponent } from './components/wallet-connect/wallet-connect.component';
import { LoginViewComponent } from './components/login-view/login-view.component';
import { Web3ConnectComponent } from './components/web3-connect/web3-connect.component';
import { LoadingSpotComponent } from './components/loading-spot/loading-spot.component';
import { ActionButtonsComponent } from './components/action-buttons/action-buttons.component';
import { ModalPriceSetComponent } from './components/modal-price-set/modal-price-set.component';
import { ModalMintAssetComponent } from './components/modal-mint-asset/modal-mint-asset.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingAnimationComponent } from "./components/loading-animation/loading-animation.component";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ToastrComponent } from "./components/toastr/toastr.component";

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const APP_NAME = 'FlowFrenz NFT Marketplace';
const APP_LOGO_URL = './assets/icons/ff-icon.png';
const darkMode: boolean = true;

@NgModule({
  declarations: [
    AppComponent,
    BabylonComponent,
    CollectionPreviewComponent,
    ViewToggleComponent,
    HeaderBarComponent,
    FooterBarComponent,
    SingleCardComponent,
    CompactListViewComponent,
    AssetDetailViewComponent,
    AssetPreviewComponent,
    TrackVisibilityDirective,
    TraitComponent,
    AboutDropdownComponent,
    ContractDetailsComponent,
    WalletConnectComponent,
    LoginViewComponent,
    Web3ConnectComponent,
    LoadingSpotComponent,
    ActionButtonsComponent,
    ModalPriceSetComponent,
    ModalMintAssetComponent,
  ],
  providers: [BreakpointObserver],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    LoadingAnimationComponent,
    ToastrComponent
]
})
export class AppModule { }

export const coinbaseWallet = new CoinbaseWalletSDK({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
  darkMode: darkMode
})
