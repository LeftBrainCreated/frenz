import { Component, Input } from '@angular/core';
import { Collection } from 'src/app/interfaces/Collection';

@Component({
  selector: 'app-collection-preview',
  templateUrl: './collection-preview.component.html',
  styleUrls: ['./collection-preview.component.scss']
})

export class CollectionPreviewComponent {
  @Input() collection!: Collection;


}
