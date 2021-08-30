const weakrefAvailable = (() => {
  try {
    const obj = {};
    new WeakRef(obj);
  } catch {
    console.log("using weakref polyfill");
    return false;
  }
  return true;
})();

export type AnyCallback<T extends unknown[]> = (...args: T) => unknown;

function makeCallback<T extends unknown[]>(wr: WeakRef<AnyCallback<T>>) {
  return (...a: T) => {
    const x = wr.deref();
    if (x) {
      x(...a);
      return true;
    } else {
      return false;
    }
  };
}

export function makeWeakCallback<T extends unknown[]>(fn: AnyCallback<T>): (...args: T) => boolean {
  if (weakrefAvailable) {
    const wr = new WeakRef(fn);
    return makeCallback(wr);
  } else {
    return (...a: T) => {
      fn(...a);
      return true;
    };
  }
}
