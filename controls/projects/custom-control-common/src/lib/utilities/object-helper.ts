export class ObjectHelper {
  static getObjValue(obj: object, field: string, separator = '/') {
    const parameters = field.split(separator);
    let value = obj;
    do {
      const valueKey = parameters.shift();
      value = value[valueKey];
      if (value === undefined || value === null) {
        value = undefined;
        break;
      }
    } while (parameters.length > 0);

    return value;
  }
}
