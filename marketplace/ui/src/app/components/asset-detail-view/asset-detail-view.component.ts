import { Component, Input, OnInit } from '@angular/core';
import { Asset } from 'src/app/interfaces/asset';
import { AlchemyService } from 'src/app/services/alchemy.service';

@Component({
  selector: 'app-asset-detail-view',
  templateUrl: './asset-detail-view.component.html',
  styleUrls: ['./asset-detail-view.component.scss']
})
export class AssetDetailViewComponent implements OnInit {
  @Input() asset!: Asset;

  owner: string = '';
  listPrice: string = '0.00';
  processing: boolean = false;

  constructor(
    private alchemy: AlchemyService
  ) { }

  ngOnInit(): void {
    this.alchemy.getOwnersForNft(this.asset.contract.address, parseInt(this.asset.tokenId))
      .then((res: any) => {
        this.owner = res.owners[0];
      })
  }
}
