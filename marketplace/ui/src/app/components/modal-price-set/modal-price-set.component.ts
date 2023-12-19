import { Component, Input, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { Asset } from 'src/app/interfaces/asset';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'modal-price-set',
  templateUrl: './modal-price-set.component.html',
  styleUrls: ['./modal-price-set.component.scss']
})
export class ModalPriceSetComponent {
  listPrice: string = '';

  @Input() assetId: string;

  constructor(
    private mpWeb3: MarketplaceService
  ) { }

  submitListing(e: Event) {
    e.stopPropagation();
    this.mpWeb3.listPriceSet.next({ id: this.assetId, listPrice: this.listPrice });
  }

}
