import { Component, Input } from '@angular/core';
import { Collection } from 'src/app/interfaces/Asset';

@Component({
  selector: 'app-featured-collection',
  templateUrl: './featured-collection.component.html',
  styleUrls: ['./featured-collection.component.scss']
})
export class FeaturedCollectionComponent {
  @Input() collection!: Collection;

}
