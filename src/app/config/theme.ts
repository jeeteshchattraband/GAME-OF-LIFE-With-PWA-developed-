export class Theme {

  private _name: string;
  private _generations: boolean;
  private _alive: string[];
  private _dead: string[];
  private _border: boolean;
  private _borderColor: string;
  private _mutable: boolean;

  constructor(theme: {
    name: string,
    generations: boolean,
    alive: string[],
    dead: string[],
    border: boolean,
    borderColor: string,
    mutable: boolean}) {

    this._name = theme.name;
    this._generations = theme.generations;
    this._alive = theme.alive;
    this._dead = theme.dead;
    this._border = theme.border;
    this._borderColor = theme.borderColor;
    this._mutable = theme.mutable;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get generations(): boolean {
    return this._generations;
  }

  set generations(value: boolean) {
    this._generations = value;
  }

  get alive(): string[] {
    return this._alive;
  }

  set alive(value: string[]) {
    this._alive = value;
  }

  get dead(): string[] {
    return this._dead;
  }

  set dead(value: string[]) {
    this._dead = value;
  }

  get border(): boolean {
    return this._border;
  }

  set border(value: boolean) {
    this._border = value;
  }

  get borderColor(): string {
    return this._borderColor;
  }

  set borderColor(value: string) {
    this._borderColor = value;
  }

  get mutable(): boolean {
    return this._mutable;
  }

  set mutable(value: boolean) {
    this._mutable = value;
  }

  private checkMutability() {
    if (!this.mutable) {
      throw new Error('Theme of ' + this.name + ' is not mutable');
    }
  }

  clone(name: string, mutable: boolean): Theme {
    return new Theme({
      name: name,
      generations: this.generations,
      alive: this.alive.slice(),
      dead: this.dead,
      border: this.border,
      borderColor: this.borderColor,
      mutable: mutable
    });
  }
}
