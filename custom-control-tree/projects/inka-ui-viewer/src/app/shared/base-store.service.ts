export class BaseStoreService<T> {
  protected items = new Map<string, T>();

  registry(type: string, value: T) {
    this.items.set(type, value);
  }

  get(type: string): T | undefined {
    return this.items.get(type);
  }

  has(type: string): boolean {
    return this.items.has(type);
  }

  clear() {
    this.items.clear();
  }
}
