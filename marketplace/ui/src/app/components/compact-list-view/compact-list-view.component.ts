import { Component, Input, AfterContentInit } from '@angular/core';
import { Collection } from 'src/app/interfaces/Collection';

@Component({
  selector: 'app-compact-list-view',
  templateUrl: './compact-list-view.component.html',
  styleUrls: ['./compact-list-view.component.scss']
})
export class CompactListViewComponent implements AfterContentInit {
  @Input() collection!: Collection;
  imageUri = '';
  ipfsGateway = 'https://bronze-royal-tiglon-325.mypinata.cloud/ipfs/';

  ngAfterContentInit(): void {
    if (this.collection.collectionDefaultImage.indexOf('/ipfs/') > -1) {
      this.imageUri = this.ipfsGateway + this.collection.collectionDefaultImage.substring(this.collection.collectionDefaultImage.indexOf('/ipfs/') + 6);
    } else if (this.collection.collectionDefaultImage.startsWith('ipfs://')) {
      this.imageUri = this.ipfsGateway + this.collection.collectionDefaultImage.substring(7);
    } else if (this.collection.ipfs != '') {
      this.imageUri = this.ipfsGateway + this.collection.ipfs;
    } else {
      this.imageUri = this.collection.collectionDefaultImage;
    }
  }

}
