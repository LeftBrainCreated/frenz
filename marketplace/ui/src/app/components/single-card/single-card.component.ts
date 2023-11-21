import { Component, Input } from '@angular/core';
import { Collection } from 'src/app/interfaces/Collection';

@Component({
  selector: 'app-single-card',
  templateUrl: './single-card.component.html',
  styleUrls: ['./single-card.component.scss']
})
export class SingleCardComponent {
  @Input() col?: Collection

  currentId: number = 0;
}
