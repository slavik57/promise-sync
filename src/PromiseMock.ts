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

  // TODO: remove the setter when typescript 2.0 is released
  public set state(state: PromiseState) {
    throw 'Cannot set state';
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

  public static all(iterable: any[]): PromiseMock<any[]> {
    var result = new PromiseMock<any[]>();

    if (iterable.length === 0) {
      result.resolve([]);
      return result;
    }

    var allPromises: PromiseMock<any>[] = iterable.map(this._castOrCreateResolvedToPromise)

    allPromises.forEach((_promise: PromiseMock<any>) => {
      _promise.then(
        _data => this._resolveIfAllResolvedWithDataOfAll(result, allPromises),
        _error => this._rejectIfPending(result, _error)
      );
    });

    return result;
  }

  public static race(iterable: any[]): PromiseMock<any> {
    var result = new PromiseMock<any[]>();

    if (iterable.length === 0) {
      result.resolve();
      return result;
    }

    var allPromises: PromiseMock<any>[] = iterable.map(this._castOrCreateResolvedToPromise)

    allPromises.forEach((_promise: PromiseMock<any>) => {
      _promise.then(
        _data => this._resolveIfPending(result, _data),
        _error => this._rejectIfPending(result, _error)
      );
    });

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

    this._handleIfNotPending();

    return callback.nextPromise;
  }

  public catch(failureCallback: IFailureCallback<T>): PromiseMock<any> {
    var callback: ICallback<T> = {
      failure: failureCallback,
      nextPromise: new PromiseMock<any>()
    }

    this._callbacks.push(callback);

    this._handleIfNotPending();

    return callback.nextPromise;
  }

  public then<U>(successCallback: ISuccessCallback<T, U>, failureCallback?: IFailureCallback<T>): PromiseMock<U> {
    var callback: ICallback<T> = {
      success: successCallback,
      failure: failureCallback,
      nextPromise: new PromiseMock<U>()
    }

    this._callbacks.push(callback);

    this._handleIfNotPending();

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

  private static _castOrCreateResolvedToPromise(obj: any): PromiseMock<any> {
    if (obj instanceof PromiseMock) {
      return obj;
    } else {
      return PromiseMock.resolve(obj);
    }
  }

  private static _resolveIfAllResolvedWithDataOfAll(promise: PromiseMock<any[]>, dataSourcePromises: PromiseMock<any>[]): void {
    var isAllFulfilled: boolean =
      dataSourcePromises.reduce(
        (_prev: boolean, _current: PromiseMock<any>) => _prev && _current.isFulfilled(),
        true);

    if (!isAllFulfilled) {
      return;
    }

    var results: any[] = dataSourcePromises.map(_promise => _promise._resolvedData);

    promise.resolve(results);
  }

  private static _resolveIfPending(promise: PromiseMock<any[]>, data: any): void {
    if (promise.isPending()) {
      promise.resolve(data);
    }
  }

  private static _rejectIfPending(promise: PromiseMock<any[]>, error: any): void {
    if (promise.isPending()) {
      promise.reject(error);
    }
  }

  private _handleIfNotPending(): void {
    if (this.isRejected()) {
      this._rejectCallbacks(this._rejectedReason);
    } else if (this.isFulfilled()) {
      this._resolveCallbacks(this._resolvedData);
    }
  }

  private _resolveCallbacks(data: T): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._resolveCallback(_callback, data));

    this._callFinallyCallbacksAsResolved(data);
    this._clearCallbacks();
  }

  private _resolveCallback(callback: ICallback<T>, data: T): void {
    if (!callback.success) {
      if (!callback.finally) {
        callback.nextPromise.resolve(data);
      }
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

    if (this._isHasThenMethod(result)) {
      result.then(
        _data => callback.nextPromise.resolve(_data),
        _error => callback.nextPromise.reject(_error)
      );
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
      if (!callback.finally) {
        callback.nextPromise.reject(error);
      }
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

    if (this._isHasThenMethod(result)) {
      result.then(
        _data => callback.nextPromise.resolve(_data),
        _error => callback.nextPromise.reject(_error)
      );
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

    if (this._isHasFinallyMethod(result)) {
      result.finally(action);
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

  private _isHasThenMethod(result: any): boolean {
    return !!result && !!result.then;
  }

  private _isHasFinallyMethod(result: any): boolean {
    return !!result && !!result.finally;
  }
}
