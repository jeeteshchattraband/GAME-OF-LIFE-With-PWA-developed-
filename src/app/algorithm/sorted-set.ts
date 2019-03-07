import * as Util from 'typescript-collections/dist/lib/util';
import {ArrayIterator} from './array-iterator';
import {Optional} from './optional';
import {SortedDictionary} from './sorted-dictionary';
import {IDictionaryPair} from 'typescript-collections/dist/lib/Dictionary';
import {arrays} from 'typescript-collections';

export class SortedSet<T> {

  private dictionary: SortedDictionary<T, T>;

  constructor(compareFn?: (a: T, b: T) => number, toStringFunction?: (item: T) => string) {
    this.dictionary = new SortedDictionary<T, T>(compareFn != null ?
      (a: IDictionaryPair<T, T>, b: IDictionaryPair<T, T>) => {
        return compareFn(a.key, b.key);
      } : null,
      toStringFunction);
  }

  has(element: T): boolean {
    return this.dictionary.containsKey(element);
  }

  get(element: T): T {
    return this.dictionary.getValue(element);
  }

  getByHash(hash: string) {
    return this.dictionary.getValueByHash(hash);
  }

  getOptionalValue(element: T): Optional<T> {
    return this.dictionary.getOptionalValue(element);
  }

  add(element: T): boolean {
    if (this.has(element) || Util.isUndefined(element)) {
      return false;
    } else {
      this.dictionary.setValue(element, element);
      return true;
    }
  }

  remove(element: T): boolean {
    if (!this.has(element)) {
      return false;
    } else {
      this.dictionary.remove(element);
      return true;
    }
  }

  forEach(callback: Util.ILoopFunction<T>): void {
    this.dictionary.forEach(function (k, v) {
      return callback(v);
    });
  }

  toArray(): T[] {
    return this.dictionary.values();
  }

  isEmpty(): boolean {
    return this.dictionary.isEmpty();
  }

  size(): number {
    return this.dictionary.size();
  }

  clear(): void {
    this.dictionary.clear();
  }

  iterator(): Iterator<T> {
    return new ArrayIterator(this.toArray());
  }

  toString(): string {
    return arrays.toString(this.toArray());
  }
}
