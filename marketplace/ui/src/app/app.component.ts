import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { distinctUntilChanged, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'flowfrenz-marketplace';
  breakpoint$: any;
  mobileView: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpoint$ = this.breakpointObserver
    .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, '(min-width: 500px)'])
    .pipe(
      tap(value => console.log(value)),
      distinctUntilChanged()
    );
  }

  async ngOnInit(): Promise<void> {
    this.breakpoint$.subscribe(() =>
      this.breakpointChanged()
    );
  }

  private breakpointChanged() {
    if(this.breakpointObserver.isMatched(Breakpoints.TabletPortrait)) {
      this.mobileView = true;
    } else if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
      this.mobileView = true;
    } else if(this.breakpointObserver.isMatched(Breakpoints.HandsetLandscape)) {
      this.mobileView = true;
    } else if(this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait)) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }
}
