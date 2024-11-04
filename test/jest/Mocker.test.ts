/**
 * @group unit/core
 */

import { M, mock } from '@';

interface TestMock {
  a(param1: string, param2: boolean): boolean;
  b(param1: string, param2: boolean): boolean;
  p(param: string): Promise<number>;
  returnsThis(): this;
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

  test('allowsNotExistingDynamic() ', async () => {
    m.allowsNotExistingDynamic(['not_exists']);

    m.i["not_exists"];

    m.checkExpections();
  });

  describe("Promises", () => {
    test('andReturnResolved', async () => {
      m.expects('p', 'test').andReturnResolved(10);

      const current = await m.i.p('test');

      expect(current).toEqual(10);
      m.checkExpections();
    });

    test('andReturnRejected', async () => {
      const error = new Error("test");
      m.expects('p', 'test').andReturnRejected(error);

      await expect(() => m.i.p('test')).rejects.toBe(error);

      m.checkExpections();
    });
  });

  test('andReturnThis', () => {
    m.expects('returnsThis').andReturnThis();

    const current = m.i.returnsThis();

    expect(current).toBe(m.i);
    m.checkExpections();
  });

  test('reset', () => {
    m.expects("a", "test", true);
    m.i.a("test", true);
    m.checkExpections();

    m.reset();
    m.expects("a", "test2", true);
    m.i.a("test2", true);
    m.checkExpections();
  });
});
