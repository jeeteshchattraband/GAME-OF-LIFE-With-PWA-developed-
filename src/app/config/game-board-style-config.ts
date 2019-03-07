import {Config} from './config';
import {ConfigType} from './config-type';

export class GameBoardStyleConfig extends Config {

  private _generations = false;
  private _borderColor = '#bbc4c4';
  private _aliveCellColors: string[] = ['#5cb85c'];
  private _deadCellColor: string[] = ['#f1f3f3'];

  constructor() {
    super(ConfigType.GAME_BOARD_STYLE);
  }

  get generations(): boolean {
    return this._generations;
  }

  set generations(value: boolean) {
    this._generations = value;
    this.emitChange();
  }

  get borderColor(): string {
    return this._borderColor;
  }

  set borderColor(value: string) {
    this._borderColor = value;
    this.emitChange();
  }

  get aliveCellColors(): string[] {
    return this._aliveCellColors;
  }

  set aliveCellColors(value: string[]) {
    this._aliveCellColors = value;
    this.emitChange();
  }

  get deadCellColors(): string[] {
    return this._deadCellColor;
  }

  set deadCellColors(value: string[]) {
    this._deadCellColor = value;
    this.emitChange();
  }

  get maxGenerations(): number {
    if (this.generations) {
      return Math.max(this.aliveCellColors.length, this.deadCellColors.length) - 1;
    }
    return 0;
  }
}
