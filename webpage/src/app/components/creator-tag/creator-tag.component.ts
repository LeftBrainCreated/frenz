import { Component, Input } from '@angular/core';
import { Creator } from 'src/app/interfaces/Creator';

@Component({
  selector: 'app-creator-tag',
  templateUrl: './creator-tag.component.html',
  styleUrls: ['./creator-tag.component.scss']
})
export class CreatorTagComponent {

  @Input() creator!: Creator;

  artistsName: string = "Emerson Philips";
  ethQty: number = 3.2;
  twitterLink: string = '';

}
