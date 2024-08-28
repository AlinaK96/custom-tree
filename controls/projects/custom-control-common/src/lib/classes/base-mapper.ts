type Constructor<T> = { new (): T };

interface IBaseMaper<From, To> {
  map(data: From): To;
}

export abstract class BaseMapper<From, To> implements IBaseMaper<From, To> {
  abstract map(data: From): To;

  static getInstance<T>(this: Constructor<T>) {
    return new this();
  }
}
