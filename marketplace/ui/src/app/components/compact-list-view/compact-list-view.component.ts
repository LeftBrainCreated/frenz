import { Component, Input } from '@angular/core';
import { Collection } from 'src/app/interfaces/Collection';

@Component({
  selector: 'app-compact-list-view',
  templateUrl: './compact-list-view.component.html',
  styleUrls: ['./compact-list-view.component.scss']
})
export class CompactListViewComponent {
  @Input() collection!: Collection;

}
