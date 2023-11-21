import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-trait',
  templateUrl: './trait.component.html',
  styleUrls: ['./trait.component.scss']
})
export class TraitComponent {
  @Input() trait: any;

  name: string = "Trait Name";
  value: string = "SomeValue";

}
