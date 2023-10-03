import { Mocker, mocks } from '@';

class TestMock {
  public method(a: number): number {
    return a * 2;
  }
}

class TestClassConstructor {
  public constructor(public mock1: TestMock, public readonly b: number, public mock2: TestMock) {}
}

describe('Mockers', () => {
  let m = mocks(
    new (class {
      public mock1: TestMock;
      public mock2: TestMock;
    })(),
  );
  let testClass: TestClassConstructor;

  beforeEach(() => {
    m = m.xFresh();
  });

  test('xFresh()', () => {
    expect(m.mock1).toBeInstanceOf(Mocker);
    expect(m.mock2).toBeInstanceOf(Mocker);
  });

  test('xNewInject() when has non mock arg given in array', () => {
    testClass = m.xNewInject(TestClassConstructor, [10]);

    expect(testClass.mock1).toBe(m.mock1.i);
    expect(testClass.b).toBe(10);
  });

  test('xNewInject() when has non mock arg given in object', () => {
    testClass = m.xNewInject(TestClassConstructor, { b: 10 });

    expect(testClass.mock1).toBe(m.mock1.i);
    expect(testClass.b).toBe(10);
    expect(testClass.mock2).toBe(m.mock2.i);
  });

  test('xNewInject() when has non mock arg and not given', () => {
    expect(() => m.xNewInject(TestClassConstructor)).toThrow("Missing value of parameter 'b', check your test code");
  });

  test('xCheckExpections()', () => {
    m.mock1.expects('method', 5).andReturn(10);

    expect(() => m.xCheckExpections()).toThrow('');
  });
});
