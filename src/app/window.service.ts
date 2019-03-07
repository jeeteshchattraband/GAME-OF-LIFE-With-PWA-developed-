import {Injectable, NgZone} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WindowService {

  private _resize = new Subject<void>();
  private resize = this._resize.asObservable();

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(throttleTime(100))
        .subscribe(() => {
          this._resize.next();
        });
    });
  }

  sizeChanges(): Observable<void> {
    return this.resize;
  }

  forceResize(): void {
    this._resize.next();
  }

}
