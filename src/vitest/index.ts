import { expect, vi } from 'vitest';
import { Mocker } from '../Mocker';

Mocker.__MockFnFactory = (name: string) => {
  const m = vi.fn();
  m.mockName(name);
  return m;
};

export * from '../Mocker';
export * from '../Mockers';