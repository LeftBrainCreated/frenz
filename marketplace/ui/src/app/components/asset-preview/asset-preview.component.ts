import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TrackVisibilityDirective } from 'src/app/directives/track-visibility.directive';
import { Asset } from 'src/app/interfaces/Asset';
import { IpfsService } from 'src/app/services/ipfs.service';

@Component({
  selector: 'app-asset-preview',
  templateUrl: './asset-preview.component.html',
  styleUrls: ['./asset-preview.component.scss']
})
export class AssetPreviewComponent implements OnInit {
  @Input() asset!: Asset;

  imageAddress = 'ipfs://QmWQhMevMi1XNLyMAgwp94XTS2pmanwMpTwbJGAghQ4DuD';
  assetName = 'Asset Name Here';

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
        // this.ipfs.getIpfs(this.asset.tokenUri.gateway);
        if (this.asset.media.length > 0) {
          this.imageAddress = this.asset.media[0].thumbnail;
        }
        this.cdr.detectChanges();
      }
    })

  }


}
