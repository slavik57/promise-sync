import { PromiseState } from './enums/PromiseState';
import { ISuccessCallback } from './interfaces/ISuccessCallback';
import { IFailureCallback } from './interfaces/IFailureCallback';
export declare class PromiseMock<T> {
    private static _assertionExceptionTypes;
    private _callbacks;
    private _state;
    private _resolvedData;
    private _rejectedReason;
    constructor();
    readonly state: PromiseState;
    static setAssertionExceptionTypes(assertionExceptionTypes: Function[]): void;
    static resolve<T>(data?: T): PromiseMock<T>;
    static reject<T>(error?: any): PromiseMock<T>;
    resolve(data?: T): void;
    reject(reason?: any): void;
    success<U>(successCallback: ISuccessCallback<T, U>): PromiseMock<U>;
    catch(failureCallback: IFailureCallback<T>): PromiseMock<any>;
    then<U>(successCallback: ISuccessCallback<T, U>, failureCallback?: IFailureCallback<T>): PromiseMock<U>;
    finally(successCallback: () => any): PromiseMock<T>;
    isPending(): boolean;
    isFulfilled(): boolean;
    isRejected(): boolean;
    private _resolveCallbacks(data);
    private _resolveCallback(callback, data);
    private _rejectCallbacks(error);
    private _rejectCallback(callback, error);
    private _callFinallyCallbacks();
    private _callFinallyCallbacksAsResolved(data);
    private _callFinallyCallbacksAsRejected(error);
    private _callFinallyCallbackAndThenPerformAction(callback, action);
    private _callFinallyCallback(callback);
    private _resolveFinallyCallbackNextCallbackWithData(callback, data);
    private _rejectFinallyCallbackNextCallbackWithError(callback, error);
    private _clearCallbacks();
    private _isNullOrUndefined(obj);
    private _throwIfAssertionExceptionType(error);
}
