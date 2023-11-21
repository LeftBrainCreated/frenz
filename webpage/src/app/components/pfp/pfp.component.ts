import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pfp',
  templateUrl: './pfp.component.html',
  styleUrls: ['./pfp.component.scss']
})
export class PfpComponent {

  @Input() name: string = '';
  @Input() imagePath: string = '';

}
