import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TrackVisibilityDirective } from 'src/app/directives/track-visibility.directive';
import { Asset } from 'src/app/interfaces/asset';
import { IpfsService } from 'src/app/services/ipfs.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { AlchemyService } from 'src/app/services/alchemy.service';
import Web3 from 'web3';

@Component({
  selector: 'app-asset-preview',
  templateUrl: './asset-preview.component.html',
  styleUrls: ['./asset-preview.component.scss']
})
export class AssetPreviewComponent implements OnInit {
  @Input() asset!: Asset;

  imageAddress = '';
  assetName = 'Asset Name Here';
  ownedAsset: boolean = false;
  listedAsset: boolean = false;
  whitelisted: boolean = false;
  processing: boolean = false;

  constructor(
    private ipfs: IpfsService,
    private visTrack: TrackVisibilityDirective,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.ipfs.IpfsResult.subscribe((res) => {
      if (res.id == this.asset.tokenUri.gateway) {
        this.imageAddress = res.data.image;
      }
    })

    this.visTrack.visibile.subscribe((val) => {
      if (val) {
        if (this.asset.media.length > 0) {
          this.imageAddress = this.asset.media[0].thumbnail;
        } else if (this.asset.tokenUri.raw) {
          this.ipfs.getIpfs(this.asset.tokenUri.raw);
          // this.imageAddress = this.asset.tokenUri.gateway;
        }

        // this.imageAddress = this.imageAddress.replace('ipfs//', 'ipfs/');

        if (this.asset.title == '') {
          this.asset.title = `${this.asset.contract.symbol} #${this.asset.tokenId}`
        }

        this.cdr.detectChanges();
      }
    })
  }

  // public async listAsset(e: Event) {
  //   this.processing = true;
  //   e.stopPropagation();
  //   await this.mpWeb3.listNft(this.asset.contract.address, this.asset.tokenId, .0002)
  //     .then(() => {
  //       this.mpWeb3.getListing(this.asset.contract.address, this.asset.tokenId);
  //       this.processing = false;
  //     }).catch((ex) => {
  //       console.log(ex);
  //       this.processing = false;
  //     });
  // }

  // public async updateListing(e: Event) {
  //   this.processing = true;
  //   e.stopPropagation();
  //   await this.mpWeb3.updateListing(this.asset.contract.address, this.asset.tokenId, .0002)
  //     .then(() => {
  //       this.mpWeb3.getListing(this.asset.contract.address, this.asset.tokenId);
  //       this.processing = false;
  //     }).catch((ex) => {
  //       console.log(ex);
  //       this.processing = false;
  //     });
  // }

  // public async cancelListing(e: Event) {
  //   this.processing = true;
  //   e.stopPropagation();
  //   await this.mpWeb3.cancelListing(this.asset.contract.address, this.asset.tokenId)
  //     .then(() => {
  //       this.listedAsset = false;
  //       this.processing = false;
  //     }).catch((ex) => {
  //       console.log(ex);
  //       this.processing = false;
  //     });

  // }

  // public async buyItem(e: Event) {
  //   this.processing = true;
  //   e.stopPropagation();
  //   await this.mpWeb3.buyItem(this.asset.contract.address, this.asset.tokenId, this.asset.listing.price)
  //     .then(() => {
  //       this.ownedAsset = true;
  //       this.listedAsset = false;
  //       this.processing = false;
  //     }).catch((ex) => {
  //       console.log(ex);
  //       this.processing = false;
  //     });
  // }

}
