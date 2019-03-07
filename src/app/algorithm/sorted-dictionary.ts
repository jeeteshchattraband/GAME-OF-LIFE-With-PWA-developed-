import Dictionary, {IDictionaryPair} from 'typescript-collections/dist/lib/Dictionary';
import * as Util from 'typescript-collections/dist/lib/util';
import {ArrayIterator} from './array-iterator';
import {Optional} from './optional';

export class SortedDictionary<K, V> extends Dictionary<K, V> {

  private compareFn: (a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>) => number;

  constructor(compareFn?: (a: IDictionaryPair<K, V>, b: IDictionaryPair<K, V>) => number, toStrFunction?: (key: K) => string) {
    super(toStrFunction);
    this.compareFn = compareFn;
  }

  getOptionalValue(key: K): Optional<V> {
    return new Optional(this.getValue(key));
  }

  keys(): K[] {
    return this.entries().map((dictionaryPair: IDictionaryPair<K, V>) => {
      return dictionaryPair.key;
    });
  }

  values(): V[] {
    return this.entries().map((dictionaryPair: IDictionaryPair<K, V>) => {
      return dictionaryPair.value;
    });
  }

  forEach(callback: (key: K, value: V) => any): void {
    for (const entry of this.entries()) {
      const ret = callback(entry.key, entry.value);
      if (ret === false) {
        return;
      }
    }
  }

  entries(): IDictionaryPair<K, V> [] {
    const entries: IDictionaryPair<K, V>[] = [];
    for (const key in this.table) {
      if (Util.has(this.table, key)) {
        const pair: IDictionaryPair<K, V> = this.table[key];
        entries.push(pair);
      }
    }
    return this.compareFn != null ? entries.sort(this.compareFn) : entries;
  }

  removeIf(shouldRemove: (value: V) => boolean) {
    for (const key in this.table) {
      if (Util.has(this.table, key)) {
        const pair: IDictionaryPair<K, V> = this.table[key];
        if (shouldRemove(pair.value)) {
          this.remove(pair.key);
        }
      }
    }
  }

  getValueByHash(hash: string) {
    const pair: IDictionaryPair<K, V> = this.table['$' + hash];
    if (Util.isUndefined(pair)) {
      return undefined;
    }
    return pair.value;
  }

  iterator(): Iterator<IDictionaryPair<K, V>> {
    return new ArrayIterator(this.entries());
  }
}
