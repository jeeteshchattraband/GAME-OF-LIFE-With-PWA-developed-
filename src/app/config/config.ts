import {ConfigType} from './config-type';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

export abstract class Config {

  private changeSubject: Subject<ConfigType> = new Subject();
  private _silent = false;

  protected constructor(private _configType: ConfigType) {
  }

  protected emitChange() {
    this.changeSubject.next(this.configType);
  }

  get configType(): ConfigType {
    return this._configType;
  }

  get observe(): Observable<Config> {
    return this.changeSubject.pipe(filter(() => !this.silent), map(() => this));
  }

  get silent(): boolean {
    return this._silent;
  }

  set silent(value: boolean) {
    this._silent = value;
  }
}
