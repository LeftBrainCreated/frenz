import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { Asset } from 'src/app/interfaces/asset';
import { ListedAsset, OwnedAsset } from 'src/app/interfaces/marketplace-assets';
import { AlchemyService } from 'src/app/services/alchemy.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { UiService } from 'src/app/services/ui.service';
import Web3 from 'web3';

var _asset: Asset;
var _mp: MarketplaceService;


@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent implements OnInit {
  @Input() asset: Asset;
  @Output() processingChange = new EventEmitter<boolean>();
  private _processing: boolean = false;

  ownedAsset: boolean = false;
  listedAsset: boolean = false;
  whitelisted: boolean = false;
  priceModalVisible: boolean = false;
  listPrice: string;

  constructor(
    private mpWeb3: MarketplaceService,
    private alchemy: AlchemyService,
    private cdr: ChangeDetectorRef,
    private ui: UiService
  ) { }

  ngOnInit(): void {
    this.updateUi();

    this.mpWeb3.ListingObs.subscribe((listing) => {
      if (Web3.utils.toChecksumAddress(this.asset.contract.address) == Web3.utils.toChecksumAddress(listing.contractAddress) && this.asset.tokenId == listing.tokenId.toString()) {
        this.asset.listing = listing;
        this.listedAsset = true;
      }
    })

    this.ui.UiChangesObs.subscribe(() => {
      this.updateUi();
    })

    this.mpWeb3.listPriceSet.subscribe((args: any) => {
      if (args.id == this.asset.tokenId) {
        this.listAsset(args.listPrice);
      }
    })
  }

  get processing(): boolean {
    return this._processing;
  }

  @Input()
  set processing(value: boolean) {
    this._processing = value;
    this.processingChange.emit(value);
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

  public async listAsset(listPrice: string) {
    this.processing = true;
    if (listPrice == '' || listPrice == undefined) {
      console.log('invalid list price');
      this.processing = false;
    } else {
      // e.stopPropagation();
      await this.mpWeb3.listNft(this.asset.contract.address, this.asset.tokenId, parseFloat(listPrice))
        .then(() => {
          this.mpWeb3.getListing(this.asset.contract.address, this.asset.tokenId);
          this.mpWeb3.getListedAssets();
          this.processing = false;
          this.closePriceModal(undefined);
        }).catch((ex) => {
          console.log(ex);
          this.processing = false;
          this.closePriceModal(undefined);
        });
    }
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
      .then(async () => {
        // this.listedAsset = false;
        await this.mpWeb3.getListedAssets()
          .then(() => {
            this.updateUi();
            this.processing = false;
          });
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
        this.closePriceModal(undefined);
      }).catch((ex) => {
        console.log(ex);
        this.closePriceModal(undefined);
      });
  }

  public openPriceModal(e: Event) {
    e.stopPropagation();
    this.processing = true;
    this.priceModalVisible = true;
    this.cdr.detectChanges();
    // const dialogRef = this.dialog.open(ModalPriceSetComponent, {
    //   // data: { landId: landId, walletConnected: this.walletConnected },
    //   panelClass: 'price-set-modal',
    // });
  }

  public closePriceModal(e: Event) {
    if (e !== undefined) {
      e.stopPropagation();
    }
    this.priceModalVisible = false;
    this.processing = false;
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
