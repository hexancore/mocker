/* eslint-disable @typescript-eslint/ban-types */

import { MockFn } from './MockFnFactory';

interface MethodCallExpection {
  method: string;
  args?: any[];
}

export class MethodMock<M extends (...args: any) => any> {
  public constructor(private readonly mock: MockFn) {}

  public andReturnWith(implementation: (...args: Parameters<M>) => ReturnType<M>): void {
    this.mock.mockImplementationOnce(implementation);
  }

  public andReturn(value: ReturnType<M>): void {
    this.mock.mockReturnValueOnce(value);
  }

  public andReturnResolved(value: ReturnType<M>): void {
    this.mock.mockResolvedValueOnce(value);
  }
}

export class Mocker<T extends object> {
  private readonly mock: Partial<T>;
  private readonly mockProxy: T;
  private methodCallExpections: MethodCallExpection[];
  private notExistingDynamicSet: Set<string>;
  public static __MockFnFactory = null;

  public constructor(private readonly name = 'mock') {
    this.mock = {};
    this.mockProxy = this.createMockProxy();

    this.methodCallExpections = [];
    this.notExistingDynamicSet = new Set();
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

  public expects<K extends keyof T, A extends ((...args: any) => any) & T[K]>(name: K, ...args: Parameters<A>): MethodMock<A> {
    const mockFunction = this.createMockFn(<string>name);
    this.methodCallExpections.push({ method: <string>name, args });
    return new MethodMock<A>(mockFunction);
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

  public checkExpections(): void {
    this.methodCallExpections.forEach((expection: MethodCallExpection) => {
      this.checkExpection(expection);
    });
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
