export function getConstructorParams(f) {
  const reg = /constructor\((.+)\)/;
  const params = reg.exec(f);

  return params ? params[1].split(',').map((p) => p.trimStart()) : [];
}

export type Ctor<U> = new (...args: any[]) => U;
