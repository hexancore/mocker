export function getConstructorParams(f: any): string[] {
  const reg = /constructor\((.+)\)/;
  const params = reg.exec(f);

  return params ? params[1].split(',').map((p) => p.trimStart()) : [];
}

export type Ctor<U> = new (...args: any[]) => U;
