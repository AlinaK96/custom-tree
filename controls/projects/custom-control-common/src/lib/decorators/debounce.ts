export function debounce(timeout: number) {
  let timeoutRef: ReturnType<typeof setTimeout>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }

      timeoutRef = setTimeout(() => {
        originalMethod.apply(this, args);
      }, timeout);
    };

    return descriptor;
  };
}
