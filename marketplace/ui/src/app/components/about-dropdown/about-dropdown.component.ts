import { Component, Input } from '@angular/core';
import { Asset } from 'src/app/interfaces/asset';

@Component({
  selector: 'app-about-dropdown',
  templateUrl: './about-dropdown.component.html',
  styleUrls: ['./about-dropdown.component.scss']
})
export class AboutDropdownComponent {
  @Input() asset?: Asset;

  visible = false;

  public dropdown() {
    this.visible = !this.visible;
  }

}
