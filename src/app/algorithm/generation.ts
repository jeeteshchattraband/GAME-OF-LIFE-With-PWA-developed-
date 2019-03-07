export class Generation<T> {
  private _generation = 0;

  constructor(private _value: T) {
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (this._value !== value) {
      this._generation = 0;
    }
    this._value = value;
  }

  get generation(): number {
    return this._generation;
  }

  increment(): void {
    this._generation++;
  }

}
