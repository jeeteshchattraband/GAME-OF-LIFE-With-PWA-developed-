import {Config} from './config';
import {ConfigType} from './config-type';

export class GameBoardConfig extends Config {

  private _height: number;
  private _width: number;
  private _columns: number;
  private _rows: number;
  private _xScreenOffset = 0;
  private _yScreenOffset = 0;
  private baseCellSize = 10;
  private baseCellSpace = 1;
  private _cellSize = this.baseCellSize;
  private _cellSpace = this.baseCellSpace;
  private _zoom = this.baseCellSize;
  private _fullScreen = false;
  private _refreshable = false;


  constructor() {
    super(ConfigType.GAME_BOARD);
  }

  get height(): number {
    return this._height;
  }

  screenSize(width: number, height: number) {
    this._width = width;
    this._height = height;
    const oldColumns = this.columns;
    const oldRows = this.rows;
    this.determineColumnsAndRows();
    if (oldColumns != null && oldRows != null) {
      this._xScreenOffset = this._xScreenOffset + Math.round((oldColumns - this.columns) / 2);
      this._yScreenOffset = this._yScreenOffset + Math.round((oldRows - this.rows) / 2);
    }
    this.emitChange();
  }

  private determineColumnsAndRows() {
    this._columns = Math.ceil(this.width / (this.cellSpace + this.cellSize));
    this._rows = Math.ceil(this.height / (this.cellSpace + this.cellSize));
  }

  get width(): number {
    return this._width;
  }

  get columns(): number {
    return this._columns;
  }

  get rows(): number {
    return this._rows;
  }

  get xScreenOffset(): number {
    return this._xScreenOffset;
  }

  set xScreenOffset(value: number) {
    this._xScreenOffset = value;
    this.emitChange();
  }

  get yScreenOffset(): number {
    return this._yScreenOffset;
  }

  set yScreenOffset(value: number) {
    this._yScreenOffset = value;
    this.emitChange();
  }

  get cellSize(): number {
    return this._cellSize;
  }

  get cellSpace(): number {
    return this._cellSpace;
  }

  set cellSpace(value: number) {
    this._cellSpace = value;
    const oldColumns = this.columns;
    const oldRows = this.rows;
    if (oldColumns != null && oldRows != null) {
      this.determineColumnsAndRows();
      this._xScreenOffset = this._xScreenOffset + Math.round((oldColumns - this.columns) / 2);
      this._yScreenOffset = this._yScreenOffset + Math.round((oldRows - this.rows) / 2);
    }
    this.emitChange();
  }

  get zoom(): number {
    return this._zoom;
  }

  set zoom(zoom: number) {
    const round = zoom < this.zoom ? Math.floor : Math.ceil;
    this._zoom = Math.max(zoom, 1);
    this._cellSize = this._zoom;
    const oldColumns = this.columns;
    const oldRows = this.rows;
    this.determineColumnsAndRows();
    this._xScreenOffset = this._xScreenOffset + round((oldColumns - this.columns) / 2);
    this._yScreenOffset = this._yScreenOffset + round((oldRows - this.rows) / 2);
    this.emitChange();
  }

  get fullScreen(): boolean {
    return this._fullScreen;
  }

  set fullScreen(value: boolean) {
    this._fullScreen = value;
    this.emitChange();
  }

  get refreshable(): boolean {
    return this._refreshable;
  }

  set refreshable(value: boolean) {
    this._refreshable = value;
    this.emitChange();
  }

}
