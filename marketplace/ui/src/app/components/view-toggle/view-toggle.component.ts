import { Component } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-view-toggle',
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.scss']
})
export class ViewToggleComponent {

  multiView: boolean = true;

  constructor(
    private ui: UiService
  ) {  }

  switchViewStyle() {
    this.multiView = !this.multiView;
    this.ui.switchViewModeObs.next(this.multiView);
  }
}
