"use strict";
var PromiseState_1 = require('./enums/PromiseState');
var PromiseMock = (function () {
    function PromiseMock() {
        this._callbacks = [];
        this._state = PromiseState_1.PromiseState.Pending;
    }
    Object.defineProperty(PromiseMock.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    PromiseMock.prototype.resolve = function (data) {
        if (!this.isPending()) {
            throw new Error('Cannot resolve not pending promise');
        }
        this._resolvedData = data;
        this._state = PromiseState_1.PromiseState.Fulfilled;
        this._resolveCallbacks(data);
    };
    PromiseMock.prototype.reject = function (reason) {
        if (!this.isPending()) {
            throw new Error('Cannot reject not pending promise');
        }
        this._state = PromiseState_1.PromiseState.Rejected;
        this._rejectCallbacks(reason);
    };
    PromiseMock.prototype.success = function (successCallback) {
        var callback = {
            success: successCallback,
            nextPromise: new PromiseMock()
        };
        this._callbacks.push(callback);
        if (this.isFulfilled()) {
            this._resolveCallbacks(this._resolvedData);
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype.catch = function (failureCallback) {
        var callback = {
            failure: failureCallback,
            nextPromise: new PromiseMock()
        };
        this._callbacks.push(callback);
        if (this.isRejected()) {
            this._rejectCallbacks(this._rejectedReason);
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype.then = function (successCallback, failureCallback) {
        var callback = {
            success: successCallback,
            failure: failureCallback,
            nextPromise: new PromiseMock()
        };
        this._callbacks.push(callback);
        if (this.isFulfilled()) {
            this._resolveCallbacks(this._resolvedData);
        }
        if (this.isRejected()) {
            this._rejectCallbacks(this._rejectedReason);
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype.finally = function (successCallback) {
        var callback = {
            finally: successCallback,
            nextPromise: new PromiseMock()
        };
        this._callbacks.push(callback);
        if (!this.isPending()) {
            this._callFinallyCallbacks();
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype.isPending = function () {
        return this.state === PromiseState_1.PromiseState.Pending;
    };
    PromiseMock.prototype.isFulfilled = function () {
        return this.state === PromiseState_1.PromiseState.Fulfilled;
    };
    PromiseMock.prototype.isRejected = function () {
        return this.state === PromiseState_1.PromiseState.Rejected;
    };
    PromiseMock.prototype._resolveCallbacks = function (data) {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            return _this._resolveCallback(_callback, data);
        });
        this._callFinallyCallbacksAsResolved(data);
        this._clearCallbacks();
    };
    PromiseMock.prototype._resolveCallback = function (callback, data) {
        if (!callback.success) {
            return;
        }
        var result;
        try {
            result = callback.success(data);
        }
        catch (e) {
            callback.nextPromise.reject(e);
            return;
        }
        if (result instanceof PromiseMock) {
            var promiseResult = result;
            promiseResult.finally(function () { return callback.nextPromise.resolve(data); });
        }
        else {
            callback.nextPromise.resolve(result);
        }
    };
    PromiseMock.prototype._rejectCallbacks = function (error) {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            return _this._rejectCallback(_callback, error);
        });
        this._callFinallyCallbacksAsRejected(error);
        this._clearCallbacks();
    };
    PromiseMock.prototype._rejectCallback = function (callback, error) {
        if (!callback.failure) {
            return;
        }
        var result;
        try {
            result = callback.failure(error);
        }
        catch (e) {
            callback.nextPromise.reject(e);
            return;
        }
        if (result instanceof PromiseMock) {
            var promiseResult = result;
            promiseResult.finally(function () { return callback.nextPromise.reject(error); });
        }
        else {
            callback.nextPromise.resolve(result);
        }
    };
    PromiseMock.prototype._callFinallyCallbacks = function () {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            return _this._callFinallyCallback(_callback);
        });
        this._clearCallbacks();
    };
    PromiseMock.prototype._callFinallyCallbacksAsResolved = function (data) {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            _this._callFinallyCallbackAndThenPerformAction(_callback, function () { return _this._resolveFinallyCallbackNextCallbackWithData(_callback, data); });
        });
    };
    PromiseMock.prototype._callFinallyCallbacksAsRejected = function (error) {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            _this._callFinallyCallbackAndThenPerformAction(_callback, function () { return _this._rejectFinallyCallbackNextCallbackWithError(_callback, error); });
        });
    };
    PromiseMock.prototype._callFinallyCallbackAndThenPerformAction = function (callback, action) {
        var result = this._callFinallyCallback(callback);
        if (result instanceof PromiseMock) {
            var promiseResult = result;
            promiseResult.finally(action);
        }
        else {
            action();
        }
    };
    PromiseMock.prototype._callFinallyCallback = function (callback) {
        if (!callback.finally) {
            return;
        }
        try {
            return callback.finally();
        }
        catch (e) {
        }
    };
    PromiseMock.prototype._resolveFinallyCallbackNextCallbackWithData = function (callback, data) {
        if (!callback.finally) {
            return;
        }
        try {
            callback.nextPromise.resolve(data);
        }
        catch (e) {
        }
    };
    PromiseMock.prototype._rejectFinallyCallbackNextCallbackWithError = function (callback, error) {
        if (!callback.finally) {
            return;
        }
        try {
            callback.nextPromise.reject(error);
        }
        catch (e) {
        }
    };
    PromiseMock.prototype._clearCallbacks = function () {
        this._callbacks = [];
    };
    PromiseMock.prototype._isNullOrUndefined = function (obj) {
        return obj === null || obj === undefined;
    };
    return PromiseMock;
}());
exports.PromiseMock = PromiseMock;
