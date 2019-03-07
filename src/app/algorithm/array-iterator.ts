export class ArrayIterator<T> implements Iterator<T> {

  private pointer = 0;

  constructor(private array: T[]) {}

  next(): IteratorResult<T> {
    if (this.pointer < this.array.length) {
      return {
        done: false,
        value: this.array[this.pointer++]
      };
    } else {
      return {
        done: true,
        value: null
      };
    }
  }

}
