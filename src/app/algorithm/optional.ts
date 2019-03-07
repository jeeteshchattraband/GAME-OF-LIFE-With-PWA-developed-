export class Optional<T> {

  constructor(private value: T) {}

  orElse(orElse: () => T) {
    if (this.value != null) {
      return this.value;
    }
    return orElse();
  }
}
