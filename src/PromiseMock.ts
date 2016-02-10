import {ISuccessCallback} from './interfaces/ISuccessCallback';
import {IFailureCallback} from './interfaces/IFailureCallback';
import {ICallback} from './interfaces/ICallback';
import {PromiseState} from './enums/PromiseState';

export class PromiseMock<T> {
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

  public resolve(data?: T): void {
    if (!this._isPending()) {
      throw new Error('Cannot resolve not pending promise');
    }

    this._resolvedData = data;
    this._state = PromiseState.Resolved;

    this._resolveCallbaks(data);
  }

  public reject(reason?: any): void {
    if (!this._isPending()) {
      throw new Error('Cannot reject not pending promise');
    }

    this._state = PromiseState.Rejected;

    this._rejectCallbacks(reason);
  }

  public success(successCallback: ISuccessCallback<T>): PromiseMock<T> {
    var callback: ICallback<T> = {
      success: successCallback,
      nextPromise: new PromiseMock<T>()
    }

    this._callbacks.push(callback);

    if (this._isResolved()) {
      this._resolveCallbaks(this._resolvedData);
    }

    return callback.nextPromise;
  }

  public catch(failureCallback: IFailureCallback<T>): PromiseMock<T> {
    var callback: ICallback<T> = {
      failure: failureCallback,
      nextPromise: new PromiseMock<T>()
    }

    this._callbacks.push(callback);

    if (this._isRejected()) {
      this._rejectCallbacks(this._rejectedReason);
    }

    return callback.nextPromise;
  }

  private _isPending(): boolean {
    return this.state === PromiseState.Pending;
  }

  private _isResolved(): boolean {
    return this.state === PromiseState.Resolved;
  }

  private _isRejected(): boolean {
    return this.state === PromiseState.Rejected;
  }

  private _resolveCallbaks(data: T): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._resolveCallback(_callback, data));
  }

  private _isNullOrUndefined(obj: any): boolean {
    return obj === null || obj === undefined;
  }

  private _resolveCallback(callback: ICallback<T>, data: T): void {
    if (!callback.success) {
      return;
    }

    var result: any;
    try {
      result = callback.success(data);
    } catch (e) {
      callback.nextPromise.reject(e);
      return;
    }

    if (result instanceof PromiseMock) {
      var promiseResult = <PromiseMock<any>>result;
      promiseResult.success(_data => callback.nextPromise.resolve(_data));
      promiseResult.catch(_error => callback.nextPromise.reject(_error));
    } else {
      callback.nextPromise.resolve(result);
    }
  }

  private _rejectCallbacks(error: any): void {
    this._callbacks.forEach((_callback: ICallback<T>) =>
      this._rejectCallback(_callback, error));
  }

  private _rejectCallback(callback: ICallback<T>, error: any): void {
    if (!callback.failure) {
      return;
    }

    try {
      callback.failure(error);
    } catch (e) {
      callback.nextPromise.reject(e);
    }
  }
}
