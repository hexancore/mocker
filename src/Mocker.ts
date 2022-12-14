/* eslint-disable @typescript-eslint/ban-types */

interface MethodCallExpection {
  method: string;
  args?: any[];
}

export class MethodMock<M extends (...args: any) => any> {
  public constructor(private readonly mock: jest.Mock) {}

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
  public readonly name: string;
  private methodCallExpections: MethodCallExpection[];

  public constructor(name: string = `mock`) {
    this.mock = {};
    this.name = name;
    this.methodCallExpections = [];
    this.mockProxy = this.createMockProxy();
  }

  private createMockProxy(): T {
    const mock = this.mock;
    const mockName = this.name;

    return new Proxy<T>(mock as T, {
      get: (target: T, prop: string) => {
        if (target[prop]) {
          return target[prop];
        } else {
          return (...args: any[]) => {
            let message = `expect(${mockName}.${prop}).not.toBeCalled`;
            message += args.length > 0 ? `With(${args.join(', ')})` : '()';
            const e = new Error(message);
            const split = e.stack.split('\n');
            e.stack = [split[0], split[2]].join('\n');
            throw e;
          };
        }
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

  public expects<K extends keyof T, A extends ((...args: any) => any) & T[K]>(name: K, ...args: Parameters<A>): MethodMock<A> {
    let mockFunction: jest.Mock;
    if (!this.mock[name]) {
      mockFunction = this.mock[<string>name] = jest.fn();
      mockFunction.mockName(this.name + '.' + <string>name);
    } else {
      mockFunction = this.mock[<string>name];
    }

    this.methodCallExpections.push({ method: <string>name, args });
    return new MethodMock<A>(mockFunction);
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
