# Mocker
Two words can describe it: **simple and magical :)**
Helper stuff to create **mocks** in **TypeScript** in Jest or Vitest

**You just need it!**

## Usage:

**In Jest**
```ts
import { M, mock } from '@hexancore/mocker';
```

**In Vitest**
```ts
import { M, mock } from '@hexancore/mocker/vitest';
```

**Example**
```ts
import { M, mock } from '@hexancore/mocker';

interface TestMock {
  a(param1: string, param2: boolean): boolean;
  b(param1: string, param2: boolean): boolean;
}

describe('Example test suite', () => {
  let m: M<TestMock>; // Define mock variable with your class or interface wrapped with `M` type

  beforeEach(() => {
    // in beforeEach create `Mocker` with mock() factory method
    // you can simply mock interface or class and give it descriptive name(used in errors)
    m = mock('my_mock');
  });

  afterEach(() => {
    // after execute your code, you can check sets expectations results with it(for many tests call it in jest "afterEach")
    mock.checkExpections();
  });

  test('Example test', () => {
    // define method call expectation(available methods list will be shows in VS + it will hint all parameters and return type )
    m.expects('a', 'test', true).andReturn(true);

    // mock "i" property is object of mocked class, pass it where you need
    m.i.a('test', true);
  });
```

### Defining expectation

`Mocker.expects(method, ...args)` returns `MethodMock` object with you can define return value by:
*  `andReturnWith((implementation: (...args: any) => any)` - you can define your own method implementation
*  `andReturn(value: any)` - define returns passed value once
*  `andReturnThis()` - define returns this
*  `andReturnResolved` - simple sugar function for andReturnWith((() => Promise.resolve(value))
*  `andReturnRejected` - simple sugar function for andReturnWith((() => Promise.reject(error))

Using `Jest.expect` matchers in `Mocker.expects`
```ts
let userRepository = mock<UserRepository>();
userRepository
      .expects('save', expect.objectContaining({ email, username, password: hashedPassword }))
      .andReturn(OKA(true));
```

### Reset

Mock expectations can be reset with `Mocker.reset()` or with passed `true` to `Mocker.checkExpections(true)`.

### Mockers
Manages a group of defined mocks in a more efficient way of writing test code and simplifing injecting many mocks to class object.

**For use add to your `tsconfig.json`**
```json
 "compilerOptions": {
    "useDefineForClassFields": true,
 }
```
**Example**
```ts
import { mocks } from '@hexancore/mocker';

class TestMock {
  public method(a: number): number {
    return a * 2;
  }
}

class TestClassConstructor {
  public constructor(public mock1: TestMock, public readonly b: number, public mock2: TestMock) {}

  public method(): number {
    return mock1.method(this.b)+mock2.method(this.b);
  }
}

describe('Mockers', () => {
  // define variable using `mocks` and anonymous class with mocks you want create
  let m = mocks(
    new (class {
      mock1: TestMock;
      mock2: TestMock;
    })(),
  );

  // variable to create instance with injected mocks
  let testClass: TestClassConstructor;


  beforeEach(() => {
    // use xFresh() to get new Mockers instance
    // methods of Mockers using `x` prefix for be after your mocks names on VS list
    m = m.xFresh();

    // you can create new instance of your class with injected mocks and other parameters
    testClass = m.xNewInject(TestClassConstructor, { b: 10 });

    // other non mock parameters can be given as object or array
    // testClass = m.xNewInject(TestClassConstructor, [10]);
  });

  afterEach(() => {
    m.xCheckExpections(); // checks all mocks expections
  });

  test('test()', () => {
    m.mock1.expects('method', 10).andReturn(5);
    m.mock2.expects('method', 10).andReturn(6);

    const current = testClass.method();
  });
```
