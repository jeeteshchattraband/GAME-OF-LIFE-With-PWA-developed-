import {GolRule} from 'app/templates/gol-rule';
import {Config} from './config';
import {ConfigType} from './config-type';

export class GameConfig extends Config {
  private _rule: GolRule = new GolRule('B3/S23');

  constructor() {
    super(ConfigType.GAME);
  }

  get rule(): GolRule {
    return this._rule;
  }

  set rule(value: GolRule) {
    this._rule = value;
    this.emitChange();
  }
}
