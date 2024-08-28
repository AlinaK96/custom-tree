export class ArrayUtilities {
  static onlyUnique = (item, index, self) => self.indexOf(item) === index;

  static groupBy<TObject = Record<string, unknown>>(
    array: TObject[],
    itemKeyPredicate: (item: TObject) => string
  ) {
    return array.reduce((acc, curr) => {
      const key = itemKeyPredicate(curr);
      return (acc[key] = curr);
    }, {});
  }

  static flatten<TArray>(array: TArray[], mapCallback: (TArray) => unknown) {
    return array.reduce((flat, toFlatten) => {
      return flat.concat(
        Array.isArray(toFlatten)
          ? ArrayUtilities.flatten(toFlatten, mapCallback)
          : toFlatten
      );
    }, []);
  }

  static nestify<TArray>(
    array: TArray[],
    itemKey: string = 'id',
    parentKey: string = 'parentId',
    nestedKey: string = 'items',
    parentValue: string = undefined
  ) {
    const tree = array
      .filter((x) => x[parentKey] === parentValue)
      .map((x) => {
        x[nestedKey] = ArrayUtilities.nestify(
          array,
          itemKey,
          parentKey,
          nestedKey,
          x[itemKey]
        );
        return x;
      });

    return tree;
  }
}
