import { Component, Input } from '@angular/core';
import { Asset } from 'src/app/interfaces/Asset';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss']
})
export class ContractDetailsComponent {
  @Input() asset?: Asset;

  visible = false;

  public dropdown() {
    this.visible = !this.visible;
  }
}
