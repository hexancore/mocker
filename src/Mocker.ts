/* eslint-disable @typescript-eslint/ban-types */

import { MockFn } from './MockFnFactory';

interface MethodCallExpection {
  method: string;
  args?: any[];
}

export class MethodMock<M extends (...args: any) => any> {
  public constructor(private readonly mock: MockFn) { }

  public andReturnWith(implementation: (...args: Parameters<M>) => ReturnType<M>): void {
    this.mock.mockImplementationOnce(implementation);
  }

  public andReturn(value: ReturnType<M>): void {
    this.mock.mockReturnValueOnce(value);
  }

  public andReturnThis(): void {
    this.mock.mockReturnThis();
  }

  public andReturnResolved(value: ReturnType<M> extends Promise<infer U> ? U : never): void {
    this.mock.mockResolvedValueOnce(value);
  }

  public andReturnRejected<E extends Error>(error: ReturnType<M> extends Promise<any> ? E : never): void {
    this.mock.mockRejectedValueOnce(error);
  }
}

export type MethodMockInterface<T extends object, M extends (...args: any) => any> = ReturnType<M> extends Promise<any>
  ? ReturnType<M> extends T ? MethodMock<M> : Omit<MethodMock<M>, 'andReturnThis'>
  : Omit<MethodMock<M>,
    ReturnType<M> extends T
    ? 'andReturnResolved' | 'andReturnRejected'
    : 'andReturnResolved' | 'andReturnRejected' | 'andReturnThis'
  >;

export class Mocker<T extends object> {
  private readonly mock: Partial<Record<keyof T, MockFn>>;
  private readonly mockProxy: T;
  private methodCallExpections: MethodCallExpection[];
  private checkedExpections: boolean;
  private notExistingDynamicSet: Set<string>;
  public static __MockFnFactory = null;

  public constructor(private readonly name = 'mock') {
    this.mock = {};
    this.mockProxy = this.createMockProxy();

    this.methodCallExpections = [];
    this.notExistingDynamicSet = new Set();
    this.checkedExpections = false;
  }

  private createMockProxy(): T {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const m = this;

    return new Proxy<T>(this.mock as T, {
      get: (target: T, prop: string) => {
        if (m.notExistingDynamicSet.has(prop)) {
          return undefined;
        }

        if (target[prop]) {
          return target[prop];
        }

        return (...args: any[]) => {
          let message = `expect(${m.name}.${prop}).not.toBeCalled`;
          message += args.length > 0 ? `With(${args.join(', ')})` : '()';
          const e = new Error(message);
          const split = e.stack.split('\n');
          e.stack = [split[0], split[2]].join('\n');
          throw e;
        };
      },
    });
  }

  public static of<T extends object>(name = 'mock'): Mocker<T> {
    return new Mocker(name);
  }

  /**
   * @return Returns mock instance
   */
  public get i(): T {
    return this.mockProxy;
  }

  public allowsNotExistingDynamic(names: string | string[]): Mocker<T> {
    if (Array.isArray(names)) {
      names.forEach((v) => this.notExistingDynamicSet.add(v));
    } else {
      this.notExistingDynamicSet.add(names);
    }

    return this;
  }

  public expects<K extends keyof T, M extends ((...args: any) => any) & T[K]>(name: K, ...args: Parameters<M>): MethodMockInterface<T, M> {
    const mockFunction = this.createMockFn(<string>name);
    this.methodCallExpections.push({ method: <string>name, args });
    return new MethodMock<M>(mockFunction);
  }

  private createMockFn(name: string): MockFn {
    let mockFunction: MockFn;
    if (!this.mock[name]) {
      mockFunction = this.mock[name] = Mocker.__MockFnFactory(this.name + '.' + name);
    } else {
      mockFunction = this.mock[name];
    }

    return mockFunction;
  }

  public reset(): void {
    this.methodCallExpections = [];
    for (const m in this.mock) {
      this.mock[m].mockReset();
    }
    this.checkedExpections = false;
  }

  public checkExpections(reset = false): void {
    if (this.checkedExpections) {
      throw new Error(`Mock[${this.name}]: checking same expections second time(fix code or reset mock)`);
    }

    this.methodCallExpections.forEach((expection: MethodCallExpection) => {
      this.checkExpection(expection);
    });
    this.checkedExpections = true;

    if (reset) {
      this.reset();
    }
  }

  private checkExpection(expection: MethodCallExpection): void {
    const callMatcher = expect(this.mock[expection.method]);
    if (expection.args.length > 0) {
      callMatcher.toBeCalledWith(...expection.args);
    } else {
      callMatcher.toBeCalled();
    }
  }
}

export type M<T extends object> = Mocker<T>;
export const mock = <T extends object>(name = 'mock'): Mocker<T> => Mocker.of<T>(name);
