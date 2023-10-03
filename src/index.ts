import { Mocker } from './Mocker';

Mocker.__MockFnFactory = (name: string) => {
  if (jest === undefined) {
    throw Error("Jest is not installed or you using vitest ? For use vitest: import {mock} from '@hexancore/core/vitest'");
  }

  const m = jest.fn();
  m.mockName(name);
  return m;
};

export * from './Mocker';
export * from './Mockers';
