import {Observable, Subject} from 'rxjs';

export class Ticker {
  private interval;
  private started = false;

  private subject: Subject<any> = new Subject();
  private observable: Observable<any> = this.subject.asObservable();

  constructor(private _delay: number) {
    this.delay = this._delay;
  }

  get delay(): number {
    return this._delay;
  }

  set delay(value: number) {
    if (value < 1) {
      value = 1;
    }
    this._delay = value;
    if (this.started) {
      this.start();
    }
  }

  public start() {
    this.stop();
    this.interval = setInterval(() => {
      this.subject.next();
    }, this.delay);
    this.started = true;
  }

  public isStarted() {
    return this.started;
  }

  public tick() {
    this.subject.next();
  }

  public stop() {
    clearInterval(this.interval);
    this.started = false;
  }

  public getObservable(): Observable<any> {
    return this.observable;
  }
}
