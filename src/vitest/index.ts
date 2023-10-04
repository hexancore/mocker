import * as vi2 from 'vitest';
import { Mocker } from '../Mocker';

Mocker.__MockFnFactory = (name: string) => {
  // @ts-ignore 2304
  const vifon = vi2?.vi?.fn ? vi2.vi.fn : vi.fn;
  const m = vifon();
  m.mockName(name);
  return m;
};

export * from '../Mocker';
export * from '../Mockers';