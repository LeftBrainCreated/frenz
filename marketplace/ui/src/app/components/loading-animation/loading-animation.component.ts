import { OnInit, Component } from '@angular/core';


const timeout: number = 6;

@Component({
  selector: 'app-loading-animation',
  standalone: true,
  imports: [],
  templateUrl: './loading-animation.component.html',
  styleUrl: './loading-animation.component.scss'
})
export class LoadingAnimationComponent implements OnInit {

  loadPercent: number = 0;
  loadDecimal: number = 0;

  ngOnInit(): void {
    this.tickDecimal();
    this.tickPercent();
  }

  tickDecimal(): void {
    setTimeout(() => {
      this.loadDecimal++;

      if (this.loadDecimal < 98) this.loadDecimal = 0;
      this.tickDecimal();
    }, timeout / 100);
  }

  tickPercent(): void {
    setTimeout(() => {
      this.loadPercent++;
      if (this.loadPercent < 99)
        this.tickPercent();
    }, timeout);
  }

}
