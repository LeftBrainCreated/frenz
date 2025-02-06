import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarketplaceService } from 'src/app/services/marketplace.service';

@Component({
  selector: 'modal-price-set',
  templateUrl: './modal-price-set.component.html',
  styleUrls: ['./modal-price-set.component.scss']
})
export class ModalPriceSetComponent {
  listPrice: string = '';

  @Input() assetId: string;
  @Output() modalVisibilityChange = new EventEmitter<boolean>();
  @Output() processingChange = new EventEmitter<boolean>();

  private _modalVisibility: boolean;
  private _processing: boolean;

  constructor(
    private mpWeb3: MarketplaceService
  ) { }

  get modalVisibility(): boolean {
    return this._modalVisibility;
  }

  get processing(): boolean {
    return this._processing;
  }

  @Input()
  set modalVisibility(value: boolean) {
    this._modalVisibility = value;
    this.modalVisibilityChange.emit(value);
  }

  @Input()
  set processing(value: boolean) {
    this._processing = value;
    this.processingChange.emit(value);
  }

  submitListing(e: Event) {
    e.stopPropagation();
    this.mpWeb3.listPriceSet.next({ id: this.assetId, listPrice: this.listPrice });
  }

  closeModal(): void {
    this.modalVisibility = false;
    this.processing = false;
  }

}
