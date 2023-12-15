import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { TrackVisibilityDirective } from 'src/app/directives/track-visibility.directive';
import { Asset } from 'src/app/interfaces/asset';
import { ListedAsset, OwnedAsset } from 'src/app/interfaces/marketplace-assets';
import { AlchemyService } from 'src/app/services/alchemy.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import Web3 from 'web3';

var _asset: Asset;
var _mp: MarketplaceService;

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent implements OnInit {
  ownedAsset: boolean = false;
  listedAsset: boolean = false;
  whitelisted: boolean = false;

  @Input() asset: Asset;
  @Output() processingChange = new EventEmitter();
  processing: boolean = false

  constructor(
    private mpWeb3: MarketplaceService,
    private alchemy: AlchemyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateUi();

    this.mpWeb3.ListingObs.subscribe((listing) => {
      if (Web3.utils.toChecksumAddress(this.asset.contract.address) == Web3.utils.toChecksumAddress(listing.contractAddress) && this.asset.tokenId == listing.tokenId.toString()) {
        this.asset.listing = listing;
        this.listedAsset = true;
      }
    })

    this.mpWeb3.UiChangesObs.subscribe(() => {
      this.updateUi();
    })
  }

  private async updateUi() {
    _asset = this.asset;
    _mp = this.mpWeb3;
    this.whitelisted = this.alchemy.whitelistedCollections.indexOf(Web3.utils.toChecksumAddress(this.asset.contract.address)) > -1;
    if (this.whitelisted) {
      this.ownedAsset = this.mpWeb3.ownedAssets.findIndex(this.isOwnedAsset) > -1;
      this.listedAsset = this.mpWeb3.listedAssets.findIndex(this.isListedAsset) > -1;
    }

    this.cdr.detectChanges();
  }

  public async listAsset(e: Event) {
    this.processing = true;
    e.stopPropagation();
    await this.mpWeb3.listNft(this.asset.contract.address, this.asset.tokenId, .0002)
      .then(() => {
        this.mpWeb3.getListing(this.asset.contract.address, this.asset.tokenId);
        this.mpWeb3.getListedAssets();
        this.processing = false;
      }).catch((ex) => {
        console.log(ex);
        this.processing = false;
      });
  }

  public async updateListing(e: Event) {
    this.processing = true;
    e.stopPropagation();
    await this.mpWeb3.updateListing(this.asset.contract.address, this.asset.tokenId, .0002)
      .then(() => {
        this.mpWeb3.getListing(this.asset.contract.address, this.asset.tokenId);
        this.processing = false;
      }).catch((ex) => {
        console.log(ex);
        this.processing = false;
      });
  }

  public async cancelListing(e: Event) {
    this.processing = true;
    e.stopPropagation();
    await this.mpWeb3.cancelListing(this.asset.contract.address, this.asset.tokenId)
      .then(() => {
        this.listedAsset = false;
        this.mpWeb3.getListedAssets();
        this.processing = false;
      }).catch((ex) => {
        console.log(ex);
        this.processing = false;
      });

  }

  public async buyItem(e: Event) {
    this.processing = true;
    e.stopPropagation();
    await this.mpWeb3.buyItem(this.asset.contract.address, this.asset.tokenId, this.asset.listing.price)
      .then(() => {
        this.ownedAsset = true;
        this.listedAsset = false;
        this.mpWeb3.getListedAssets();
        this.alchemy.getNFTsForWallet(this.mpWeb3.selectedAddress);
        this.processing = false;
      }).catch((ex) => {
        console.log(ex);
        this.processing = false;
      });
  }

  private isOwnedAsset(oa: OwnedAsset) {
    if (Web3.utils.toChecksumAddress(_asset.contract.address) == Web3.utils.toChecksumAddress(oa.contractAddress) && _asset.tokenId == oa.tokenId) {
      return true;
    } else {
      return false;
    }
  }

  private isListedAsset(la: ListedAsset) {
    if (
      Web3.utils.toChecksumAddress(_asset.contract.address) == Web3.utils.toChecksumAddress(la.contractAddress)
      && _asset.tokenId == la.tokenId.toString()
    ) {
      _mp.getListingById(la.listingId.toString());
      return true;
    } else {
      return false;
    }
  }

}
