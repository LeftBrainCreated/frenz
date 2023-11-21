import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public scaleObjectObs = new Subject<boolean>();
  public switchViewModeObs = new Subject<boolean>();

  constructor() { }
}
