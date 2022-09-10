import { Mocker } from './Mocker';
import { Ctor, getConstructorParams } from './util';

export type WrapPropsWithMocker<T extends Record<string, any>> = {
  [P in keyof T]: Mocker<T[P]>;
};

export type MST<T extends Record<string, any>> = WrapPropsWithMocker<T> & Mockers<T>;

/**
 * Manages a group of defined mocks in a more efficient way of writing test code
 */
export class Mockers<T> {
  public constructor(mocks) {
    Object.assign(this, mocks);
  }

  /**
   * Wraps
   * @param mocks
   * @returns
   */
  public static wrap<T>(mocks: T): MST<T> {
    return new this(mocks) as any;
  }

  /**
   * Return fresh instance of mocks manager(usually used in beforeEach)
   * @returns
   */
  public xFresh(): MST<T> {
    const obj: any = {};
    for (let p in this) {
      obj[p] = Mocker.of(p);
    }
    return new Mockers(obj) as any;
  }

  /**
   * Create object of given class constructor with injected mocks and other non Mock args;
   * @param ctr
   * @param nonMockArgs
   * @returns
   */
  public xNewInject<T>(ctr: Ctor<T>, nonMockArgs: Array<any> | any = []): T {
    const args = this.xConstructorArgs(ctr, nonMockArgs);
    return new ctr(...args);
  }

  public xConstructorArgs<T extends abstract new (...args: any) => any>(ctr: T, nonMockArgs: Array<any> | any = []): ConstructorParameters<T> {
    const args = [];
    const isNonMockArgsArray = Array.isArray(nonMockArgs);

    for (let p of getConstructorParams(ctr)) {
      const arg = this[p] ? this[p].i : isNonMockArgsArray ? nonMockArgs.shift() : nonMockArgs[p];
      if (arg === undefined) {
        throw new Error(`Missing value of parameter '${p}', check your test code`);
      }
      args.push(arg);
    }

    return args as any;
  }

  /**
   * Checks expections of all managed mocks(usually used in afterEach)
   */
  public xCheckExpections(): void {
    Object.entries(this).forEach(([_key, value]) => {
      value.checkExpections();
    });
  }
}

export const mocks = <T>(mocks: T): MST<T> => Mockers.wrap<T>(mocks);
