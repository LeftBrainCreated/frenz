import { Component, Input, OnInit, AfterContentInit } from '@angular/core';
import { time } from 'console';
import { UiService } from 'src/app/services/ui.service';

var timeout: number = 30000;

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent implements OnInit, AfterContentInit {
  @Input() targetChainId: number;
  @Input() mobileView: boolean;

  backArrowFileName = "assets/icons/1.png";
  navPage = 0;

  constructor(
    private ui: UiService
  ) { }

  ngOnInit(): void {
    this.ui.backNavObs.subscribe((page) => {
      this.navPage = this.navPage + page;
    })
  }

  public backArrow() {
    this.ui.backNavObs.next(-1);
  }

  ngAfterContentInit(): void {
    this.alterBackArrow();
  }

  private alterBackArrow() {
    setTimeout(() => {
      var rando = this.getRandomInt(1, 8);
      var glitch = this.getRandomInt(1, 100) > 85;
      var filename = "assets/icons/";
      timeout = this.getRandomInt(20, 60);

      if (glitch) {
        timeout = timeout * 100;
      } else {
        timeout = timeout * 1000;
      }

      this.backArrowFileName = filename + rando.toString() + (glitch ? "-2" : "") + ".png";
      this.alterBackArrow();

    }, timeout);
  }

  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
