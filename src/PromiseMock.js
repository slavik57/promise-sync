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
        set: function (state) {
            throw 'Cannot set state';
        },
        enumerable: true,
        configurable: true
    });
    PromiseMock.setAssertionExceptionTypes = function (assertionExceptionTypes) {
        this._assertionExceptionTypes = [];
        this._assertionExceptionTypes.push.apply(this._assertionExceptionTypes, assertionExceptionTypes);
    };
    PromiseMock.resolve = function (data) {
        var result = new PromiseMock();
        result.resolve(data);
        return result;
    };
    PromiseMock.reject = function (error) {
        var result = new PromiseMock();
        result.reject(error);
        return result;
    };
    PromiseMock.all = function (iterable) {
        var _this = this;
        var result = new PromiseMock();
        if (iterable.length === 0) {
            result.resolve([]);
            return result;
        }
        var allPromises = iterable.map(this._castOrCreateResolvedToPromise);
        allPromises.forEach(function (_promise) {
            _promise.then(function (_data) { return _this._resolveIfAllResolvedWithDataOfAll(result, allPromises); }, function (_error) { return _this._rejectIfPending(result, _error); });
        });
        return result;
    };
    PromiseMock.race = function (iterable) {
        var _this = this;
        var result = new PromiseMock();
        if (iterable.length === 0) {
            result.resolve();
            return result;
        }
        var allPromises = iterable.map(this._castOrCreateResolvedToPromise);
        allPromises.forEach(function (_promise) {
            _promise.then(function (_data) { return _this._resolveIfPending(result, _data); }, function (_error) { return _this._rejectIfPending(result, _error); });
        });
        return result;
    };
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
        this._rejectedReason = reason;
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
    PromiseMock._castOrCreateResolvedToPromise = function (obj) {
        if (obj instanceof PromiseMock) {
            return obj;
        }
        else {
            return PromiseMock.resolve(obj);
        }
    };
    PromiseMock._resolveIfAllResolvedWithDataOfAll = function (promise, dataSourcePromises) {
        var isAllFulfilled = dataSourcePromises.reduce(function (_prev, _current) { return _prev && _current.isFulfilled(); }, true);
        if (!isAllFulfilled) {
            return;
        }
        var results = dataSourcePromises.map(function (_promise) { return _promise._resolvedData; });
        promise.resolve(results);
    };
    PromiseMock._resolveIfPending = function (promise, data) {
        if (promise.isPending()) {
            promise.resolve(data);
        }
    };
    PromiseMock._rejectIfPending = function (promise, error) {
        if (promise.isPending()) {
            promise.reject(error);
        }
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
            this._throwIfAssertionExceptionType(e);
            callback.nextPromise.reject(e);
            return;
        }
        if (this._isHasThenMethod(result)) {
            result.then(function (_data) { return callback.nextPromise.resolve(_data); }, function (_error) { return callback.nextPromise.reject(_error); });
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
            this._throwIfAssertionExceptionType(e);
            callback.nextPromise.reject(e);
            return;
        }
        if (this._isHasThenMethod(result)) {
            result.then(function (_data) { return callback.nextPromise.resolve(_data); }, function (_error) { return callback.nextPromise.reject(_error); });
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
        if (this._isHasFinallyMethod(result)) {
            result.finally(action);
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
            this._throwIfAssertionExceptionType(e);
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
            this._throwIfAssertionExceptionType(e);
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
            this._throwIfAssertionExceptionType(e);
        }
    };
    PromiseMock.prototype._clearCallbacks = function () {
        this._callbacks = [];
    };
    PromiseMock.prototype._isNullOrUndefined = function (obj) {
        return obj === null || obj === undefined;
    };
    PromiseMock.prototype._throwIfAssertionExceptionType = function (error) {
        PromiseMock._assertionExceptionTypes.forEach(function (type) {
            if (error instanceof type) {
                throw error;
            }
        });
    };
    PromiseMock.prototype._isHasThenMethod = function (result) {
        return !!result && !!result.then;
    };
    PromiseMock.prototype._isHasFinallyMethod = function (result) {
        return !!result && !!result.finally;
    };
    PromiseMock._assertionExceptionTypes = [];
    return PromiseMock;
}());
exports.PromiseMock = PromiseMock;
