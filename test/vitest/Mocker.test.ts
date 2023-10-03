/**
 * @group unit/core
 */

import { M, mock } from '@/vitest';

interface TestMock {
  a(param1: string, param2: boolean): boolean;
  b(param1: string, param2: boolean): boolean;
}

describe('Mocker', () => {
  let m: M<TestMock>;

  beforeEach(() => {
    m = mock();
  });

  test('checkExpections() when called with expected arguments', async () => {
    m.expects('a', 'test', true).andReturn(true);

    m.i.a('test', true);

    m.checkExpections();
  });

  test('checkExpections() when called with not expected arguments', async () => {
    m.expects('a', 'test', true).andReturn(true);

    m.i.a('not test', false);

    expect(() => m.checkExpections()).toThrow();
  });

  test('checkExpections() when not called', async () => {
    m.expects('a', 'test', true).andReturn(true);

    expect(() => m.checkExpections()).toThrow();
  });

  test('call method when no expection', async () => {
    expect(() => m.i.a('test', false)).toThrow();
  });

  test('more expections on one method', async () => {
    m.expects('a', 'test', true).andReturn(true);
    m.expects('a', 'test2', true).andReturn(false);

    expect(m.i.a('test', true)).toBeTruthy();
    expect(m.i.a('test2', true)).toBeFalsy();

    m.checkExpections();
  });
});
