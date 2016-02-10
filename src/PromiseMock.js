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
        if (!this._isPending()) {
            throw new Error('Cannot resolve not pending promise');
        }
        this._resolvedData = data;
        this._state = PromiseState_1.PromiseState.Resolved;
        this._resolveCallbaks(data);
    };
    PromiseMock.prototype.reject = function (reason) {
        if (!this._isPending()) {
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
        if (this._isResolved()) {
            this._resolveCallbaks(this._resolvedData);
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype.catch = function (failureCallback) {
        var callback = {
            failure: failureCallback,
            nextPromise: new PromiseMock()
        };
        this._callbacks.push(callback);
        if (this._isRejected()) {
            this._rejectCallbacks(this._rejectedReason);
        }
        return callback.nextPromise;
    };
    PromiseMock.prototype._isPending = function () {
        return this.state === PromiseState_1.PromiseState.Pending;
    };
    PromiseMock.prototype._isResolved = function () {
        return this.state === PromiseState_1.PromiseState.Resolved;
    };
    PromiseMock.prototype._isRejected = function () {
        return this.state === PromiseState_1.PromiseState.Rejected;
    };
    PromiseMock.prototype._resolveCallbaks = function (data) {
        var _this = this;
        this._callbacks.forEach(function (_callback) {
            return _this._resolveCallback(_callback, data);
        });
    };
    PromiseMock.prototype._isNullOrUndefined = function (obj) {
        return obj === null || obj === undefined;
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
            promiseResult.success(function (_data) { return callback.nextPromise.resolve(_data); });
            promiseResult.catch(function (_error) { return callback.nextPromise.reject(_error); });
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
    };
    PromiseMock.prototype._rejectCallback = function (callback, error) {
        if (!callback.failure) {
            return;
        }
        try {
            callback.failure(error);
        }
        catch (e) {
            callback.nextPromise.reject(e);
        }
    };
    return PromiseMock;
}());
exports.PromiseMock = PromiseMock;
