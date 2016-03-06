import {PromiseState} from './enums/PromiseState';
import {ICallback} from './interfaces/ICallback';
import {ISuccessCallback} from './interfaces/ISuccessCallback';
import {IFailureCallback} from './interfaces/IFailureCallback';

export class PromiseMock<T> {
  private static _assertionExceptionTypes = [];
  private _callbacks: ICallback<T>[];
  private _state: PromiseState;

  private _resolvedData: T;
  private _rejectedReason: any;

  constructor() {
    this._callbacks = [];
    this._state = PromiseState.Pending;
  }

  public get state(): PromiseState {
    return this._state;
  }

  public static setAssertionExceptionTypes(assertionExceptionTypes: Function[]): void {
    this._assertionExceptionTypes = [];
    this._assertionExceptionTypes.push.apply(this._assertionExceptionTypes, assertionExceptionTypes);
  }

  public static resolve<T>(data?: T): PromiseMock<T> {
    var result = new PromiseMock<T>();
    result.resolve(data);

    return result;
  }

  public static reject<T>(error?: any): PromiseMock<T> {
    var result = new PromiseMock<T>();
    result.reject(error);

    return result;
  }

  public resolve(data?: T): void {
    if (!this.isPending()) {
      throw new Error('Cannot resolve not pending promise');
    }

    this._resolvedData = data;
    this._state = PromiseState.Fulfilled;

    this._resolveCallbacks(data);
  }

  public reject(reason?: any): void {
    if (!this.isPending()) {
      throw new Error('Cannot reject not pending promise');
    }

    this._rejectedReason = reason;
    this._state = PromiseState.Rejected;

    this._rejectCallbacks(reason);
  }

  public success<U>(successCallback: ISuccessCallback<T, U>): PromiseMock<U> {
    var callback: ICallback<T> = {
      success: successCallback,
      nextPromise: new PromiseMock<U>()
    }

    this._callbacks.push(callback);

    if (this.isFulfilled()) {
      this._resolveCallbacks(this._resolvedData);
    }

    return callback.nextPromise;
  }

  public catch(failureCallback: IFailureCallback<T>): PromiseMock<any> {
    var callback: ICallback<T> = {
      failure: failureCallback,
      nextPromise: new PromiseMock<any>()
    }

    this._callbacks.push(callback);

    if (this.isRejected()) {
      this._rejectCallbacks(this._rejectedReason);
    }

    return callback.nextPromise;
  }

  public then<U>(successCallback: ISuccessCallback<T, U>, failureCallback?: IFailureCallback<T>): PromiseMock<U> {
    var callback: ICallback<T> = {
      success: successCallback,
      failure: failureCallback,
      nextPromise: new PromiseMock<U>()
    }

    this._callbacks.push(callback);

    if (this.isFulfilled()) {
      this._resolveCallbacks(this._resolvedData);
    }

    if (this.isRejected()) {
      this._rejectCallbacks(this._rejectedReason);
    }

    return callback.nextPromise;
  }

  public finally(successCallback: () => any): PromiseMock<T> {
    var callback: ICallback<T> = {
      finally: successCallback,
      nextPromise: new PromiseMock<T>()
    };

    this._callbacks.push(callback);

    if (!this.isPending()) {
      this._callFinallyCallbacks();
    }

    return callback.nextPromise;
  }

  public isPending(): boolean {
    return this.state === PromiseState.Pending;
  }

  public isFulfilled(): boolean {
    return this.state === PromiseState.Fulfilled;
  }

  public isRejected(): boolean {
    return this.state === PromiseState.Rejected;
  }

  private _resolveCallbacks(data: T): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._resolveCallback(_callback, data));

    this._callFinallyCallbacksAsResolved(data);
    this._clearCallbacks();
  }

  private _resolveCallback(callback: ICallback<T>, data: T): void {
    if (!callback.success) {
      return;
    }

    var result: any;
    try {
      result = callback.success(data);
    } catch (e) {
      this._throwIfAssertionExceptionType(e);
      callback.nextPromise.reject(e);
      return;
    }

    if (result instanceof PromiseMock) {
      var promiseResult = <PromiseMock<any>>result;
      promiseResult.finally(() => callback.nextPromise.resolve(data));
    } else {
      callback.nextPromise.resolve(result);
    }
  }

  private _rejectCallbacks(error: any): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._rejectCallback(_callback, error));

    this._callFinallyCallbacksAsRejected(error);
    this._clearCallbacks();
  }

  private _rejectCallback(callback: ICallback<T>, error: any): void {
    if (!callback.failure) {
      return;
    }

    var result: any;
    try {
      result = callback.failure(error);
    } catch (e) {
      this._throwIfAssertionExceptionType(e);
      callback.nextPromise.reject(e);
      return;
    }

    if (result instanceof PromiseMock) {
      var promiseResult = <PromiseMock<any>>result;
      promiseResult.finally(() => callback.nextPromise.reject(error));
    } else {
      callback.nextPromise.resolve(result);
    }
  }

  private _callFinallyCallbacks(): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._callFinallyCallback(_callback));

    this._clearCallbacks();
  }

  private _callFinallyCallbacksAsResolved(data: T): void {
    this._callbacks.forEach((_callback: ICallback<T>) => {
      this._callFinallyCallbackAndThenPerformAction(_callback,
        () => this._resolveFinallyCallbackNextCallbackWithData(_callback, data));
    });
  }

  private _callFinallyCallbacksAsRejected(error: any): void {
    this._callbacks.forEach((_callback: ICallback<T>) => {
      this._callFinallyCallbackAndThenPerformAction(_callback,
        () => this._rejectFinallyCallbackNextCallbackWithError(_callback, error));
    });
  }

  private _callFinallyCallbackAndThenPerformAction(callback: ICallback<T>, action: () => void): void {
    var result: any = this._callFinallyCallback(callback);

    if (result instanceof PromiseMock) {
      var promiseResult = <PromiseMock<any>>result;

      promiseResult.finally(action);
    } else {
      action();
    }
  }

  private _callFinallyCallback(callback: ICallback<T>): any {
    if (!callback.finally) {
      return;
    }

    try {
      return callback.finally();
    } catch (e) {
      this._throwIfAssertionExceptionType(e);
    }
  }

  private _resolveFinallyCallbackNextCallbackWithData(callback: ICallback<T>, data: T): void {
    if (!callback.finally) {
      return;
    }

    try {
      callback.nextPromise.resolve(data);
    } catch (e) {
      this._throwIfAssertionExceptionType(e);
    }
  }

  private _rejectFinallyCallbackNextCallbackWithError(callback: ICallback<T>, error: any): void {
    if (!callback.finally) {
      return;
    }

    try {
      callback.nextPromise.reject(error);
    } catch (e) {
      this._throwIfAssertionExceptionType(e);
    }
  }

  private _clearCallbacks(): void {
    this._callbacks = [];
  }

  private _isNullOrUndefined(obj: any): boolean {
    return obj === null || obj === undefined;
  }

  private _throwIfAssertionExceptionType(error): void {
    PromiseMock._assertionExceptionTypes.forEach((type: Function) => {
      if (error instanceof type) {
        throw error;
      }
    });
  }
}
