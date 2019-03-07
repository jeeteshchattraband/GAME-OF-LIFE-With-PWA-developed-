export class Coordinate<T> {

  public static makeHash(x: number, y: number): string {
    return x + ',' + y;
  }

  constructor(private _x: number, private _y: number, private _value: T) {
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  public hash(): string {
    return Coordinate.makeHash(this.x, this.y);
  }
}
