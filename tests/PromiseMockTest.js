"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var index_1 = require("../index");
index_1.PromiseMock.setAssertionExceptionTypes([chai_1.AssertionError]);
var Tests;
(function (Tests) {
    var CallbackType;
    (function (CallbackType) {
        CallbackType[CallbackType["Success"] = 0] = "Success";
        CallbackType[CallbackType["Failure"] = 1] = "Failure";
    })(CallbackType || (CallbackType = {}));
    describe('PromiseMock', function () {
        var promiseMock;
        function createCallback(callbackType, callbackNumber, callbacks, dataToReturn) {
            return function (_data) {
                callbacks.push({
                    type: callbackType,
                    callbackNumber: callbackNumber,
                    data: _data
                });
                if (dataToReturn !== null &&
                    dataToReturn !== undefined) {
                    return dataToReturn;
                }
            };
        }
        function createThrowsCallback(callbackType, callbackNumber, callbacks, errorToThrow) {
            return function (_data) {
                callbacks.push({
                    type: callbackType,
                    callbackNumber: callbackNumber,
                    data: _data
                });
                if (errorToThrow !== null &&
                    errorToThrow !== undefined) {
                    throw errorToThrow;
                }
            };
        }
        function wrapPromiseWithObjectWithThenMethod(promiseMock) {
            return {
                then: function (successCallback, failureCallback) { return promiseMock.then(successCallback, failureCallback); }
            };
        }
        function wrapPromiseWithObjectWithFinallyMethod(promiseMock) {
            return {
                finally: function (callback) { return promiseMock.finally(callback); }
            };
        }
        beforeEach(function () {
            promiseMock = new index_1.PromiseMock();
        });
        describe('constructor', function () {
            it('should initialize state correctly', function () {
                var promiseMock = new index_1.PromiseMock();
                chai_1.expect(promiseMock.state).to.equal(index_1.PromiseState.Pending);
            });
            it('should initialize isFulfilled correctly', function () {
                var promiseMock = new index_1.PromiseMock();
                chai_1.expect(promiseMock.isFulfilled()).to.equal(false);
            });
            it('should initialize isRejected correctly', function () {
                var promiseMock = new index_1.PromiseMock();
                chai_1.expect(promiseMock.isRejected()).to.equal(false);
            });
            it('should initialize isPending correctly', function () {
                var promiseMock = new index_1.PromiseMock();
                chai_1.expect(promiseMock.isPending()).to.equal(true);
            });
        });
        describe('resolve', function () {
            it('resolve should set the state to resolved', function () {
                promiseMock.resolve();
                chai_1.expect(promiseMock.state).to.equal(index_1.PromiseState.Fulfilled);
            });
            it('isFulfilled should be true', function () {
                promiseMock.resolve();
                chai_1.expect(promiseMock.isFulfilled()).to.equal(true);
            });
            it('isRejected should be false', function () {
                promiseMock.resolve();
                chai_1.expect(promiseMock.isRejected()).to.equal(false);
            });
            it('isPending should be false', function () {
                promiseMock.resolve();
                chai_1.expect(promiseMock.isPending()).to.equal(false);
            });
            it('resolve twice should fail', function () {
                promiseMock.resolve();
                chai_1.expect(function () { return promiseMock.resolve(); }).to.throw(Error);
            });
            it('calling resolve after reject should fail', function () {
                promiseMock.reject();
                chai_1.expect(function () { return promiseMock.resolve(); }).to.throw(Error);
            });
        });
        describe('reject', function () {
            it('reject should set the state to rejected', function () {
                promiseMock.reject();
                chai_1.expect(promiseMock.state).to.equal(index_1.PromiseState.Rejected);
            });
            it('reject should set isFulfilled to false', function () {
                promiseMock.reject();
                chai_1.expect(promiseMock.isFulfilled()).to.equal(false);
            });
            it('reject should set isPending to false', function () {
                promiseMock.reject();
                chai_1.expect(promiseMock.isPending()).to.equal(false);
            });
            it('reject should set isRejected to false', function () {
                promiseMock.reject();
                chai_1.expect(promiseMock.isRejected()).to.equal(true);
            });
            it('reject twice should not fail and set as rejected', function () {
                promiseMock.reject();
                chai_1.expect(function () { return promiseMock.reject(); }).to.throw(Error);
            });
            it('calling reject after resolve should fail', function () {
                promiseMock.resolve();
                chai_1.expect(function () { return promiseMock.reject(); }).to.throw(Error);
            });
        });
        describe('seccuess', function () {
            it('should return new promise', function () {
                var result = promiseMock.success(function () { });
                chai_1.expect(result).not.to.be.equal(promiseMock);
                chai_1.expect(result).not.to.be.null;
            });
            it('resolving should call all the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.success(callback1);
                promiseMock.success(callback2);
                promiseMock.success(callback3);
                promiseMock.success(callback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('rejecting should not call the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.success(callback1);
                promiseMock.success(callback2);
                promiseMock.success(callback3);
                promiseMock.success(callback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('resolve and then register success callback, should call the callback', function () {
                var numberOfTimesCalled = 0;
                var callback = function () { return numberOfTimesCalled++; };
                promiseMock.resolve();
                promiseMock.success(callback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('resolving with data should call all the callbacks with correct data', function () {
                var data = {};
                var numberOfTimesCalled1 = 0;
                var callback1 = function (_data) {
                    numberOfTimesCalled1++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                var numberOfTimesCalled2 = 0;
                var callback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.success(callback1);
                promiseMock.success(callback2);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('resolve with data and then register success callback, should call the callback with correct data', function () {
                var data = {};
                var numberOfTimesCalled = 0;
                var callback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.resolve(data);
                promiseMock.success(callback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('callback throws error should still call other callbacks', function () {
                var callback1 = function () { throw ''; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.success(callback1);
                promiseMock.success(callback2);
                promiseMock.success(callback3);
                promiseMock.success(callback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('register to success on the returned promise, resolve, should call the next callback', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.success(callback1)
                    .success(callback2)
                    .success(callback3)
                    .success(callback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('register to success on the returned promise, resolve with data, should call the next callback with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, data2))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords, data3))
                    .success(createCallback(CallbackType.Success, 3, callbackRecords, data4))
                    .success(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next callback with correct data', function () {
                var data1 = 11;
                var data2 = 13;
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords))
                    .success(createCallback(CallbackType.Success, 3, callbackRecords, data2))
                    .success(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: undefined
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: undefined
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data2
                    }
                ]);
            });
            it('register to success on the returned promise, reject with error, should not call the next success callback', function () {
                var error = 'error';
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords));
                promiseMock.reject(error);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.success(function () { throw error; })
                    .success(createCallback(CallbackType.Success, 1, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, resolve with data, promises return promise, should call the next callbacks with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var returnedPromise1 = new index_1.PromiseMock();
                var returnedPromise2 = new index_1.PromiseMock();
                var returnedPromise3 = new index_1.PromiseMock();
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise1))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords, returnedPromise2))
                    .success(createCallback(CallbackType.Success, 3, callbackRecords, returnedPromise3))
                    .success(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise1.resolve(data2);
                returnedPromise2.resolve(data3);
                returnedPromise3.resolve(data4);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to success on the returned promise, resolve with data, promises return object with then, should call the next callbacks with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var returnedPromise1 = new index_1.PromiseMock();
                var returnedPromise2 = new index_1.PromiseMock();
                var returnedPromise3 = new index_1.PromiseMock();
                var objectWithThen1 = wrapPromiseWithObjectWithThenMethod(returnedPromise1);
                var objectWithThen2 = wrapPromiseWithObjectWithThenMethod(returnedPromise2);
                var objectWithThen3 = wrapPromiseWithObjectWithThenMethod(returnedPromise3);
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, objectWithThen1))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords, objectWithThen2))
                    .success(createCallback(CallbackType.Success, 3, callbackRecords, objectWithThen3))
                    .success(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise1.resolve(data2);
                returnedPromise2.resolve(data3);
                returnedPromise3.resolve(data4);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.success(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
                    .catch(createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should call the next callbacks', function () {
                var data1 = 11;
                var error1 = 12;
                var error2 = 13;
                var error3 = 14;
                var returnedPromise = new index_1.PromiseMock();
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise))
                    .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
                    .catch(createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error3
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, promises return objects with then that reject, catch callbacks throw erors, should call the next callbacks', function () {
                var data1 = 11;
                var error1 = 12;
                var error2 = 13;
                var error3 = 14;
                var returnedPromise = new index_1.PromiseMock();
                var objectWithThen = wrapPromiseWithObjectWithThenMethod(returnedPromise);
                var callbackRecords = [];
                promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, objectWithThen))
                    .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
                    .catch(createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error3
                    }
                ]);
            });
            it('register success, resolve promise, register another success, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var successCallback = function () { return numberOfTimesCalled++; };
                promiseMock.success(successCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.success(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
        });
        describe('catch', function () {
            it('should return new promise', function () {
                var result = promiseMock.catch(function () { });
                chai_1.expect(result).not.to.be.equal(promiseMock);
                chai_1.expect(result).not.to.be.null;
            });
            it('rejecting should call all the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.catch(callback1);
                promiseMock.catch(callback2);
                promiseMock.catch(callback3);
                promiseMock.catch(callback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('resolving should not call the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.catch(callback1);
                promiseMock.catch(callback2);
                promiseMock.catch(callback3);
                promiseMock.catch(callback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('reject and then register catch callback, should call the callback', function () {
                var numberOfTimesCalled = 0;
                var callback = function () { return numberOfTimesCalled++; };
                promiseMock.reject();
                promiseMock.catch(callback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('rejecting with error should call all the callbacks with correct error', function () {
                var error = {};
                var numberOfTimesCalled1 = 0;
                var callback1 = function (_data) {
                    numberOfTimesCalled1++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                var numberOfTimesCalled2 = 0;
                var callback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                promiseMock.catch(callback1);
                promiseMock.catch(callback2);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('reject with error and then register catch callback, should call the callback with correct error', function () {
                var error = {};
                var numberOfTimesCalled = 0;
                var callback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                promiseMock.reject(error);
                promiseMock.catch(callback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('callback throws error should still call other callbacks', function () {
                var callback1 = function () { throw ''; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.catch(callback1);
                promiseMock.catch(callback2);
                promiseMock.catch(callback3);
                promiseMock.catch(callback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('register to catch on the returned promise, reject, should not call the next callback', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.catch(callback1)
                    .catch(callback2)
                    .catch(callback3)
                    .catch(callback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('register to catch on the returned promise, reject with error, should not call the next callbacks ', function () {
                var error1 = 11;
                var callbackRecords = [];
                promiseMock.catch(createCallback(CallbackType.Failure, 1, callbackRecords))
                    .catch(createCallback(CallbackType.Failure, 2, callbackRecords))
                    .catch(createCallback(CallbackType.Failure, 3, callbackRecords))
                    .catch(createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, should not call the next catch callback', function () {
                var data = 'data';
                var callbackRecords = [];
                promiseMock.catch(createCallback(CallbackType.Failure, 1, callbackRecords))
                    .catch(createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to catch on the returned promise, reject with error, callback throws error, should call the next catch callback', function () {
                var error1 = 'error1';
                var error2 = 'error2';
                var error3 = 'error3';
                var error4 = 'error4';
                var callbackRecords = [];
                promiseMock.catch(createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
                    .catch(createThrowsCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error3
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error4
                    }
                ]);
                it('register catch, reject promise, register another catch, should not call first callback on the second time', function () {
                    var numberOfTimesCalled = 0;
                    var catchCallback = function () { return numberOfTimesCalled++; };
                    promiseMock.catch(catchCallback);
                    promiseMock.reject();
                    chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                    promiseMock.catch(function () { });
                    chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                });
            });
        });
        describe('then', function () {
            it('should return new promise', function () {
                var result = promiseMock.then(function () { });
                chai_1.expect(result).not.to.be.equal(promiseMock);
                chai_1.expect(result).not.to.be.null;
            });
            it('resolving should call all the success callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var successCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var successCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var successCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var successCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(successCallback1);
                promiseMock.then(successCallback2);
                promiseMock.then(successCallback3);
                promiseMock.then(successCallback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('rejecting should not call the success callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var successCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var successCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var successCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var successCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(successCallback1);
                promiseMock.then(successCallback2);
                promiseMock.then(successCallback3);
                promiseMock.then(successCallback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('resolve and then register with success callback, should call the success callback', function () {
                var numberOfTimesCalled = 0;
                var successCallback = function () { return numberOfTimesCalled++; };
                promiseMock.resolve();
                promiseMock.then(successCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('resolving with data should call all the success callbacks with correct data', function () {
                var data = {};
                var numberOfTimesCalled1 = 0;
                var successCallback1 = function (_data) {
                    numberOfTimesCalled1++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                var numberOfTimesCalled2 = 0;
                var successCallback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.then(successCallback1);
                promiseMock.then(successCallback2);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('resolve with data and then register success callback, should call the success callback with correct data', function () {
                var data = {};
                var numberOfTimesCalled = 0;
                var successCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.resolve(data);
                promiseMock.then(successCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('success callback throws error should still call other success callbacks', function () {
                var throwingSuccessCallback = function () { throw ''; };
                var numberOfTimesCalled1 = 0;
                var successCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var successCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var successCallback3 = function () { return numberOfTimesCalled3++; };
                promiseMock.then(throwingSuccessCallback);
                promiseMock.then(successCallback1);
                promiseMock.then(successCallback2);
                promiseMock.then(successCallback3);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
            });
            it('register to success on the returned promise, resolve, should call the next success callback', function () {
                var numberOfTimesCalled1 = 0;
                var successCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var successCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var successCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var successCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(successCallback1)
                    .then(successCallback2)
                    .then(successCallback3)
                    .then(successCallback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('register to success on the returned promise, resolve with data, should call the next success callback with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, data2))
                    .then(createCallback(CallbackType.Success, 2, callbackRecords, data3))
                    .then(createCallback(CallbackType.Success, 3, callbackRecords, data4))
                    .then(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next success callback with correct data', function () {
                var data1 = 11;
                var data2 = 13;
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
                    .then(createCallback(CallbackType.Success, 2, callbackRecords))
                    .then(createCallback(CallbackType.Success, 3, callbackRecords, data2))
                    .then(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: undefined
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: undefined
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data2
                    }
                ]);
            });
            it('register to success on the returned promise, reject with error, should not call the next success callback given in then', function () {
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
                    .then(createCallback(CallbackType.Success, 2, callbackRecords));
                promiseMock.reject(error);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, reject with error, should not call the next success callback', function () {
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
                    .success(createCallback(CallbackType.Success, 2, callbackRecords));
                promiseMock.reject(error);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(function () { throw error; })
                    .success(createCallback(CallbackType.Success, 1, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback registered with then', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(function () { throw error; })
                    .then(createCallback(CallbackType.Success, 1, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to success on the returned promise, resolve with data, promises return promise, should call the next success callbacks with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var returnedPromise1 = new index_1.PromiseMock();
                var returnedPromise2 = new index_1.PromiseMock();
                var returnedPromise3 = new index_1.PromiseMock();
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise1))
                    .then(createCallback(CallbackType.Success, 2, callbackRecords, returnedPromise2))
                    .then(createCallback(CallbackType.Success, 3, callbackRecords, returnedPromise3))
                    .then(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise1.resolve(data2);
                returnedPromise2.resolve(data3);
                returnedPromise3.resolve(data4);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to success on the returned promise, resolve with data, promises return objects with then, should call the next success callbacks with correct data', function () {
                var data1 = 11;
                var data2 = 12;
                var data3 = 13;
                var data4 = 14;
                var returnedPromise1 = new index_1.PromiseMock();
                var returnedPromise2 = new index_1.PromiseMock();
                var returnedPromise3 = new index_1.PromiseMock();
                var objectWithThen1 = wrapPromiseWithObjectWithThenMethod(returnedPromise1);
                var objectWithThen2 = wrapPromiseWithObjectWithThenMethod(returnedPromise2);
                var objectWithThen3 = wrapPromiseWithObjectWithThenMethod(returnedPromise3);
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, objectWithThen1))
                    .then(createCallback(CallbackType.Success, 2, callbackRecords, objectWithThen2))
                    .then(createCallback(CallbackType.Success, 3, callbackRecords, objectWithThen3))
                    .then(createCallback(CallbackType.Success, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise1.resolve(data2);
                returnedPromise2.resolve(data3);
                returnedPromise3.resolve(data4);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data2
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data3
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 4,
                        data: data4
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
                    .catch(createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error
                    }
                ]);
            });
            it('register on error on the returned promise, resolve with data, success callback throws error, should call the next error callback registered with then', function () {
                var data = 'data';
                var error = 'error';
                var callbackRecords = [];
                promiseMock.then(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
                    .then(function () { }, createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should call the next callbacks', function () {
                var data1 = 11;
                var error1 = 12;
                var error2 = 13;
                var error3 = 14;
                var returnedPromise = new index_1.PromiseMock();
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise))
                    .then(function () { }, createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
                    .catch(createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error3
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, promises return object with then that reject, catch callbacks throw erors, should call the next callbacks', function () {
                var data1 = 11;
                var error1 = 12;
                var error2 = 13;
                var error3 = 14;
                var returnedPromise = new index_1.PromiseMock();
                var objectWithThen = wrapPromiseWithObjectWithThenMethod(returnedPromise);
                var callbackRecords = [];
                promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, objectWithThen))
                    .then(function () { }, createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
                    .catch(createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.resolve(data1);
                returnedPromise.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error3
                    }
                ]);
            });
            it('register then success, resolve promise, register another success, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var successCallback = function () { return numberOfTimesCalled++; };
                promiseMock.then(successCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.success(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register then success, resolve promise, register another then success, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var successCallback = function () { return numberOfTimesCalled++; };
                promiseMock.then(successCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.then(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register success, resolve promise, register another then success, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var successCallback = function () { return numberOfTimesCalled++; };
                promiseMock.success(successCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.then(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('call with failure callback should return new promise', function () {
                var result = promiseMock.then(function () { }, function () { });
                chai_1.expect(result).not.to.be.equal(promiseMock);
                chai_1.expect(result).not.to.be.null;
            });
            it('rejecting should call all the failure callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var failureCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var failureCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(function () { }, failureCallback1);
                promiseMock.then(function () { }, failureCallback2);
                promiseMock.then(function () { }, failureCallback3);
                promiseMock.then(function () { }, failureCallback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('resolving should not call the failure callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var failureCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var failureCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(function () { }, failureCallback1);
                promiseMock.then(function () { }, failureCallback2);
                promiseMock.then(function () { }, failureCallback3);
                promiseMock.then(function () { }, failureCallback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('reject and then register with fail callback, should call the callback', function () {
                var numberOfTimesCalled = 0;
                var failureCallback = function () { return numberOfTimesCalled++; };
                promiseMock.reject();
                promiseMock.then(function () { }, failureCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('rejecting with error should call all the fail callbacks with correct error', function () {
                var error = {};
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function (_data) {
                    numberOfTimesCalled1++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                promiseMock.then(function () { }, failureCallback1);
                promiseMock.then(function () { }, failureCallback2);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('reject with error and then register with failt callback, should call the fail callback with correct error', function () {
                var error = {};
                var numberOfTimesCalled = 0;
                var failureCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                promiseMock.reject(error);
                promiseMock.then(function () { }, failureCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('failure callback throws error should still call other failure callbacks', function () {
                var throwingErrorCallback = function () { throw ''; };
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var failureCallback3 = function () { return numberOfTimesCalled3++; };
                promiseMock.then(function () { }, throwingErrorCallback);
                promiseMock.then(function () { }, failureCallback1);
                promiseMock.then(function () { }, failureCallback2);
                promiseMock.catch(failureCallback3);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
            });
            it('register to catch on the returned promise, reject, should not call the next callback', function () {
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var failureCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var failureCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(function () { }, failureCallback1)
                    .catch(failureCallback2)
                    .catch(failureCallback3)
                    .catch(failureCallback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('register to failure callback on the returned promise, reject, should not call the next failure callback', function () {
                var numberOfTimesCalled1 = 0;
                var failureCallback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var failureCallback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var failureCallback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var failureCallback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.then(function () { }, failureCallback1)
                    .then(function () { }, failureCallback2)
                    .then(function () { }, failureCallback3)
                    .then(function () { }, failureCallback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(0);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(0);
            });
            it('register to failure on the returned promise, reject with error, should not call the next callbacks ', function () {
                var error1 = 11;
                var callbackRecords = [];
                promiseMock.then(function () { }, createCallback(CallbackType.Failure, 1, callbackRecords))
                    .then(function () { }, createCallback(CallbackType.Failure, 2, callbackRecords))
                    .then(function () { }, createCallback(CallbackType.Failure, 3, callbackRecords))
                    .then(function () { }, createCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    }
                ]);
            });
            it('register to catch on the returned promise, resolve with data, should not call the next catch callback', function () {
                var data = 'data';
                var callbackRecords = [];
                promiseMock.then(function () { }, createCallback(CallbackType.Failure, 1, callbackRecords))
                    .catch(createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to failure callback on the returned promise, resolve with data, should not call the next catch callback', function () {
                var data = 'data';
                var callbackRecords = [];
                promiseMock.then(function () { }, createCallback(CallbackType.Failure, 1, callbackRecords))
                    .then(function () { }, createCallback(CallbackType.Failure, 2, callbackRecords));
                promiseMock.resolve(data);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('register to catch on the returned promise, reject with error, callback throws error, should call the next catch callback', function () {
                var error1 = 'error1';
                var error2 = 'error2';
                var error3 = 'error3';
                var error4 = 'error4';
                var callbackRecords = [];
                promiseMock.then(function () { }, createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
                    .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
                    .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
                    .catch(createThrowsCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error3
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error4
                    }
                ]);
            });
            it('register to failure callback on the returned promise, reject with error, callback throws error, should call the next catch callback', function () {
                var error1 = 'error1';
                var error2 = 'error2';
                var error3 = 'error3';
                var error4 = 'error4';
                var callbackRecords = [];
                promiseMock.then(function () { }, createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
                    .then(function () { }, createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
                    .then(function () { }, createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
                    .then(function () { }, createThrowsCallback(CallbackType.Failure, 4, callbackRecords));
                promiseMock.reject(error1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error2
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: error3
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: error4
                    }
                ]);
            });
            it('register catch, reject promise, register failure callback, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var catchCallback = function () { return numberOfTimesCalled++; };
                promiseMock.catch(catchCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.then(function () { }, function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register then, reject promise, register failure callback, should not call the failure callback on the second time', function () {
                var numberOfTimesSuccessCallbackCalled = 0;
                var successCallback = function () { return numberOfTimesSuccessCallbackCalled++; };
                var numberOfTimesFailureCallbackCalled = 0;
                var failureCallback = function () { return numberOfTimesFailureCallbackCalled++; };
                promiseMock.then(successCallback, failureCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesSuccessCallbackCalled).to.be.equal(0);
                chai_1.expect(numberOfTimesFailureCallbackCalled).to.be.equal(1);
                promiseMock.then(function () { }, function () { });
                chai_1.expect(numberOfTimesSuccessCallbackCalled).to.be.equal(0);
                chai_1.expect(numberOfTimesFailureCallbackCalled).to.be.equal(1);
            });
            it('register then, resolve promise, register failure callback, should not call the success callback on the second time', function () {
                var numberOfTimesSuccessCallbackCalled = 0;
                var successCallback = function () { return numberOfTimesSuccessCallbackCalled++; };
                var numberOfTimesFailureCallbackCalled = 0;
                var failureCallback = function () { return numberOfTimesSuccessCallbackCalled++; };
                promiseMock.then(successCallback, failureCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesSuccessCallbackCalled).to.be.equal(1);
                chai_1.expect(numberOfTimesFailureCallbackCalled).to.be.equal(0);
                promiseMock.then(function () { }, function () { });
                chai_1.expect(numberOfTimesSuccessCallbackCalled).to.be.equal(1);
                chai_1.expect(numberOfTimesFailureCallbackCalled).to.be.equal(0);
            });
        });
        describe('finally', function () {
            it('should return new promise', function () {
                var result = promiseMock.finally(function () { });
                chai_1.expect(result).not.to.be.equal(promiseMock);
                chai_1.expect(result).not.to.be.null;
            });
            it('resolving should call all the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.finally(callback1);
                promiseMock.finally(callback2);
                promiseMock.finally(callback3);
                promiseMock.finally(callback4);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('rejecting should call all the callbacks', function () {
                var numberOfTimesCalled1 = 0;
                var callback1 = function () { return numberOfTimesCalled1++; };
                var numberOfTimesCalled2 = 0;
                var callback2 = function () { return numberOfTimesCalled2++; };
                var numberOfTimesCalled3 = 0;
                var callback3 = function () { return numberOfTimesCalled3++; };
                var numberOfTimesCalled4 = 0;
                var callback4 = function () { return numberOfTimesCalled4++; };
                promiseMock.finally(callback1);
                promiseMock.finally(callback2);
                promiseMock.finally(callback3);
                promiseMock.finally(callback4);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled3).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled4).to.be.equal(1);
            });
            it('resolve and then register finally callback, should call the callback', function () {
                var numberOfTimesCalled = 0;
                var callback = function () { return numberOfTimesCalled++; };
                promiseMock.resolve();
                promiseMock.finally(callback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('resolving with data should resolve the returned promise with same data', function () {
                var data = {};
                var numberOfTimesCalled1 = 0;
                var callback1 = function () {
                    numberOfTimesCalled1++;
                };
                var numberOfTimesCalled2 = 0;
                var callback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.finally(callback1)
                    .success(callback2);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('rejecting with error should reject the returned promise with same error', function () {
                var error = {};
                var numberOfTimesCalled1 = 0;
                var callback1 = function () {
                    numberOfTimesCalled1++;
                };
                var numberOfTimesCalled2 = 0;
                var callback2 = function (_data) {
                    numberOfTimesCalled2++;
                    chai_1.expect(_data).to.be.equal(error);
                };
                promiseMock.finally(callback1)
                    .catch(callback2);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled1).to.be.equal(1);
                chai_1.expect(numberOfTimesCalled2).to.be.equal(1);
            });
            it('success callback throws error should still call the finally callback', function () {
                var successCallback = function () { throw ''; };
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.success(successCallback);
                promiseMock.finally(finallyCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('catch callback throws error should still call the finally callback', function () {
                var catchCallback = function () { throw ''; };
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.catch(catchCallback);
                promiseMock.finally(finallyCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('success callback throws error should still call the returned promise finally callback', function () {
                var successCallback = function () { throw ''; };
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.success(successCallback)
                    .finally(finallyCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('catch callback throws error should still call the returned promise finally callback', function () {
                var catchCallback = function () { throw ''; };
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.catch(catchCallback)
                    .finally(finallyCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, resolve promise, register another finally, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.finally(finallyCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.finally(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, reject promise, register another finally, should not call first callback on the second time', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                promiseMock.finally(finallyCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
                promiseMock.finally(function () { });
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return promise from callback, register success after finally, the success will be called after the returned promise is resolved', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var finallyCallback = function () { return finallyReturnedPromiseMock; };
                var data = 111;
                var numberOfTimesCalled = 0;
                var successCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.finally(finallyCallback)
                    .success(successCallback);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return object with finally from callback, register success after finally, the success will be called after the returned promise is resolved', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var objectWithFinally = wrapPromiseWithObjectWithFinallyMethod(finallyReturnedPromiseMock);
                var finallyCallback = function () { return objectWithFinally; };
                var data = 111;
                var numberOfTimesCalled = 0;
                var successCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.finally(finallyCallback)
                    .success(successCallback);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return promise from callback, register success after finally, the success will be called after the returned promise is rejected', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var finallyCallback = function () { return finallyReturnedPromiseMock; };
                var data = 111;
                var numberOfTimesCalled = 0;
                var successCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.finally(finallyCallback)
                    .success(successCallback);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return object with finally from callback, register success after finally, the success will be called after the returned promise is rejected', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var objectWithFinally = wrapPromiseWithObjectWithFinallyMethod(finallyReturnedPromiseMock);
                var finallyCallback = function () { return objectWithFinally; };
                var data = 111;
                var numberOfTimesCalled = 0;
                var successCallback = function (_data) {
                    numberOfTimesCalled++;
                    chai_1.expect(_data).to.be.equal(data);
                };
                promiseMock.finally(finallyCallback)
                    .success(successCallback);
                promiseMock.resolve(data);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return promise from callback, register catch after finally, the catch will be called after the returned promise is resolved', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var finallyCallback = function () { return finallyReturnedPromiseMock; };
                var error = 111;
                var numberOfTimesCalled = 0;
                var catchCallback = function (_error) {
                    numberOfTimesCalled++;
                    chai_1.expect(_error).to.be.equal(error);
                };
                promiseMock.finally(finallyCallback)
                    .catch(catchCallback);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return object with finally from callback, register catch after finally, the catch will be called after the returned promise is resolved', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var objectWithFinally = wrapPromiseWithObjectWithFinallyMethod(finallyReturnedPromiseMock);
                var finallyCallback = function () { return objectWithFinally; };
                var error = 111;
                var numberOfTimesCalled = 0;
                var catchCallback = function (_error) {
                    numberOfTimesCalled++;
                    chai_1.expect(_error).to.be.equal(error);
                };
                promiseMock.finally(finallyCallback)
                    .catch(catchCallback);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return promise from callback, register catch after finally, the catch will be called after the returned promise is rejected', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var finallyCallback = function () { return finallyReturnedPromiseMock; };
                var error = 111;
                var numberOfTimesCalled = 0;
                var catchCallback = function (_error) {
                    numberOfTimesCalled++;
                    chai_1.expect(_error).to.be.equal(error);
                };
                promiseMock.finally(finallyCallback)
                    .catch(catchCallback);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('register finally, return object with finally from callback, register catch after finally, the catch will be called after the returned promise is rejected', function () {
                var finallyReturnedPromiseMock = new index_1.PromiseMock();
                var objectWithFinally = wrapPromiseWithObjectWithFinallyMethod(finallyReturnedPromiseMock);
                var finallyCallback = function () { return finallyReturnedPromiseMock; };
                var error = 111;
                var numberOfTimesCalled = 0;
                var catchCallback = function (_error) {
                    numberOfTimesCalled++;
                    chai_1.expect(_error).to.be.equal(error);
                };
                promiseMock.finally(finallyCallback)
                    .catch(catchCallback);
                promiseMock.reject(error);
                chai_1.expect(numberOfTimesCalled).to.be.equal(0);
                finallyReturnedPromiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
        });
        describe('integration', function () {
            it('then().then().then() - resolve, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var data1 = 'data1';
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var error1 = 'error1';
                var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, error1);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var dataToResolve = 'dataToResolve';
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.resolve(dataToResolve);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: data1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data2
                    }
                ]);
            });
            it('then().then().then() - reject, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var data1 = 'data1';
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var error1 = 'error1';
                var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, error1);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.reject(errorToReject);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: errorToReject
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: error1
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data2
                    }
                ]);
            });
            it('then().then().then() - resolve, first success callback throws arror, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var errorToThrowFromSuccess = 'errorToThrowFromSuccess';
                var successCallback1 = createThrowsCallback(CallbackType.Success, 1, callbackRecords, errorToThrowFromSuccess);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var error1 = 'error1';
                var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, error1);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var dataToResolve = 'dataToResolve';
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.resolve(dataToResolve);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 5,
                        data: errorToThrowFromSuccess
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: error2
                    }
                ]);
            });
            it('then().then().then() - reject, first failure callback throws arror, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var data1 = 'data1';
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var errorToThrow = 'error1';
                var failureCallback1 = createThrowsCallback(CallbackType.Failure, 4, callbackRecords, errorToThrow);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.reject(errorToReject);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: errorToReject
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 5,
                        data: errorToThrow
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: error2
                    }
                ]);
            });
            it('then().then().then() - resolve, first success callback returns promise, resolve the promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var promiseToReturn = new index_1.PromiseMock();
                ;
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, promiseToReturn);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var error1 = 'error1';
                var failureCallback1 = createThrowsCallback(CallbackType.Failure, 4, callbackRecords, error1);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var dataToResolve = 'dataToResolve';
                var dataToResolveInReturnedPromise = 123;
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.resolve(dataToResolve);
                promiseToReturn.resolve(dataToResolveInReturnedPromise);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolveInReturnedPromise
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data2
                    }
                ]);
            });
            it('then().then().then() - resolve, first success callback returns promise, reject the promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var promiseToReturn = new index_1.PromiseMock();
                ;
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, promiseToReturn);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var error1 = 'error1';
                var failureCallback1 = createThrowsCallback(CallbackType.Failure, 4, callbackRecords, error1);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var dataToResolve = 'dataToResolve';
                var errorToRejectFromReturnedPromise = 123;
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.resolve(dataToResolve);
                promiseToReturn.reject(errorToRejectFromReturnedPromise);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 5,
                        data: errorToRejectFromReturnedPromise
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: error2
                    }
                ]);
            });
            it('then().then().then() - reject, first failure callback returns promise, resolve the promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var data1 = 'data1';
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var promiseToReturn = new index_1.PromiseMock();
                ;
                var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, promiseToReturn);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var errorToReject = 'errorToReject';
                var dataToResolveInReturnedPromise = 123;
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.reject(errorToReject);
                promiseToReturn.resolve(dataToResolveInReturnedPromise);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: errorToReject
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolveInReturnedPromise
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: data2
                    }
                ]);
            });
            it('then().then().then() - reject, first failure callback returns promise, reject the promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var data1 = 'data1';
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);
                var data2 = 'data2';
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);
                var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);
                var promiseToReturn = new index_1.PromiseMock();
                ;
                var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, promiseToReturn);
                var error2 = 'error2';
                var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);
                var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);
                var errorToReject = 'errorToReject';
                var errorToRejectFromReturnedPromise = 123;
                promiseMock.then(successCallback1, failureCallback1)
                    .then(successCallback2, failureCallback2)
                    .then(successCallback3, failureCallback3);
                promiseMock.reject(errorToReject);
                promiseToReturn.reject(errorToRejectFromReturnedPromise);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 4,
                        data: errorToReject
                    },
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 5,
                        data: errorToRejectFromReturnedPromise
                    },
                    {
                        type: CallbackType.Success,
                        callbackNumber: 3,
                        data: error2
                    }
                ]);
            });
            it('then().catch() - first then has no error callback, reject promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.then(successCallback)
                    .catch(failureCallback);
                promiseMock.reject(errorToReject);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: errorToReject
                    }
                ]);
            });
            it('then().then() - first then has no error callback, second then has error callback, reject promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords);
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords);
                var failureCallback1 = createCallback(CallbackType.Failure, 3, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.then(successCallback1)
                    .then(successCallback2, failureCallback1);
                promiseMock.reject(errorToReject);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: errorToReject
                    }
                ]);
            });
            it('catch().success() - resolve promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var dataToResolve = 'data';
                promiseMock.catch(failureCallback)
                    .success(successCallback);
                promiseMock.resolve(dataToResolve);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolve
                    }
                ]);
            });
            it('success().catch() - reject promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var errorToReject = 'error';
                promiseMock.success(successCallback)
                    .catch(failureCallback);
                promiseMock.reject(errorToReject);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: errorToReject
                    }
                ]);
            });
            it('catch().then() - resolve promise, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var dataToResolve = 'data';
                promiseMock.catch(failureCallback)
                    .then(successCallback);
                promiseMock.resolve(dataToResolve);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolve
                    }
                ]);
            });
            it('then().catch() - reject promise before registrations, first then has no error callback, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.reject(errorToReject);
                promiseMock.then(successCallback)
                    .catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: errorToReject
                    }
                ]);
            });
            it('then().then() - reject promise before registrations, first then has no error callback, second then has error callback, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords);
                var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords);
                var failureCallback1 = createCallback(CallbackType.Failure, 3, callbackRecords);
                var errorToReject = 'errorToReject';
                promiseMock.reject(errorToReject);
                promiseMock.then(successCallback1)
                    .then(successCallback2, failureCallback1);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 3,
                        data: errorToReject
                    }
                ]);
            });
            it('catch().success() - resolve promise, then register, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var dataToResolve = 'data';
                promiseMock.resolve(dataToResolve);
                promiseMock.catch(failureCallback)
                    .success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolve
                    }
                ]);
            });
            it('success().catch() - reject promise, then register, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var errorToReject = 'error';
                promiseMock.reject(errorToReject);
                promiseMock.success(successCallback)
                    .catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: errorToReject
                    }
                ]);
            });
            it('catch().then() - resolve promise, then register, should call correctly to callbacks', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var successCallback = createCallback(CallbackType.Success, 2, callbackRecords);
                var dataToResolve = 'data';
                promiseMock.resolve(dataToResolve);
                promiseMock.catch(failureCallback)
                    .then(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 2,
                        data: dataToResolve
                    }
                ]);
            });
            it('catch().finally() - resolve the promise, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                promiseMock.catch(failureCallback).finally(finallyCallback);
                promiseMock.resolve();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('success().finally() - reject the promise, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                promiseMock.success(successCallback).finally(finallyCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('catch().finally() - resolve the promise, then register, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                promiseMock.resolve();
                promiseMock.catch(failureCallback).finally(finallyCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('success().finally() - reject the promise, then register, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                promiseMock.reject();
                promiseMock.success(successCallback).finally(finallyCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('then().finally() - reject the promise, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                promiseMock.then(successCallback).finally(finallyCallback);
                promiseMock.reject();
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
            it('then().finally() - reject the promise, then register, should call the finally callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                promiseMock.reject();
                promiseMock.then(successCallback).finally(finallyCallback);
                chai_1.expect(numberOfTimesCalled).to.be.equal(1);
            });
        });
        describe('static resolve', function () {
            it('the returned promise state should be resolved', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(promise.state).to.equal(index_1.PromiseState.Fulfilled);
            });
            it('isFulfilled should be true', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(promise.isFulfilled()).to.equal(true);
            });
            it('isRejected should be false', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(promise.isRejected()).to.equal(false);
            });
            it('isPending should be false', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(promise.isPending()).to.equal(false);
            });
            it('call resolve should fail', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(function () { return promise.resolve(); }).to.throw(Error);
            });
            it('call reject should fail', function () {
                var promise = index_1.PromiseMock.resolve();
                chai_1.expect(function () { return promise.reject(); }).to.throw(Error);
            });
            it('subscribing with then should call the success callback', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);
                var dataToResolve = {};
                var promise = index_1.PromiseMock.resolve(dataToResolve);
                promise.then(successCallback, failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    }
                ]);
            });
            it('subscribing with success should call the success callback', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve = {};
                var promise = index_1.PromiseMock.resolve(dataToResolve);
                promise.success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    }
                ]);
            });
            it('subscribing with catch should not call the failure callback', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var dataToResolve = {};
                var promise = index_1.PromiseMock.resolve(dataToResolve);
                promise.catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('subscribing with finally should call the callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var dataToResolve = {};
                var promise = index_1.PromiseMock.resolve(dataToResolve);
                promise.finally(finallyCallback);
                chai_1.expect(numberOfTimesCalled).to.be.eql(1);
            });
        });
        describe('static reject', function () {
            it('the returned promise state should be rejected', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(promise.state).to.equal(index_1.PromiseState.Rejected);
            });
            it('isFulfilled should be false', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(promise.isFulfilled()).to.equal(false);
            });
            it('isRejected should be true', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(promise.isRejected()).to.equal(true);
            });
            it('isPending should be false', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(promise.isPending()).to.equal(false);
            });
            it('call resolve should fail', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(function () { return promise.resolve(); }).to.throw(Error);
            });
            it('call reject should fail', function () {
                var promise = index_1.PromiseMock.reject();
                chai_1.expect(function () { return promise.reject(); }).to.throw(Error);
            });
            it('subscribing with then should call the failure callback', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);
                var error = {};
                var promise = index_1.PromiseMock.reject(error);
                promise.then(successCallback, failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 2,
                        data: error
                    }
                ]);
            });
            it('subscribing with success should not call the success callback', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var error = {};
                var promise = index_1.PromiseMock.reject(error);
                promise.success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([]);
            });
            it('subscribing with catch should call the failure callback', function () {
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error = {};
                var promise = index_1.PromiseMock.reject(error);
                promise.catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error
                    }
                ]);
            });
            it('subscribing with finally should call the callback', function () {
                var numberOfTimesCalled = 0;
                var finallyCallback = function () { return numberOfTimesCalled++; };
                var error = {};
                var promise = index_1.PromiseMock.reject(error);
                promise.finally(finallyCallback);
                chai_1.expect(numberOfTimesCalled).to.be.eql(1);
            });
        });
        describe('all', function () {
            it('if passed unresolved promises, should return a promise in pending state', function () {
                var promise = index_1.PromiseMock.all([new index_1.PromiseMock()]);
                chai_1.expect(promise.state).to.be.eq(index_1.PromiseState.Pending);
            });
            it('if only one of the promises is resolved, should not resolve', function () {
                var promiseToResolve = new index_1.PromiseMock();
                var pendingPromise = new index_1.PromiseMock();
                var promise = index_1.PromiseMock.all([promiseToResolve, pendingPromise]);
                promiseToResolve.resolve();
                chai_1.expect(promise.state).to.be.eq(index_1.PromiseState.Pending);
            });
            it('if one of the promises rejects, should reject correctly', function () {
                var pendingPromise1 = new index_1.PromiseMock();
                var pendingPromise2 = new index_1.PromiseMock();
                var promiseToReject = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error = {};
                index_1.PromiseMock.all([pendingPromise1, promiseToReject, pendingPromise2]).catch(failureCallback);
                promiseToReject.reject(error);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error
                    }
                ]);
            });
            it('if all the promises reject, should reject correctly', function () {
                var promiseToReject1 = new index_1.PromiseMock();
                var promiseToReject2 = new index_1.PromiseMock();
                var promiseToReject3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error1 = {};
                var error2 = {};
                var error3 = {};
                index_1.PromiseMock.all([promiseToReject1, promiseToReject3, promiseToReject2]).catch(failureCallback);
                promiseToReject2.reject(error2);
                promiseToReject1.reject(error1);
                promiseToReject3.reject(error3);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error2
                    }
                ]);
            });
            it('if all of the promises resolve, should resolve correctly', function () {
                var promiseToResolve1 = new index_1.PromiseMock();
                var promiseToResolve2 = new index_1.PromiseMock();
                var promiseToResolve3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var dataToResolve3 = {};
                index_1.PromiseMock.all([promiseToResolve1, promiseToResolve2, promiseToResolve3]).success(successCallback);
                promiseToResolve1.resolve(dataToResolve1);
                promiseToResolve2.resolve(dataToResolve2);
                promiseToResolve3.resolve(dataToResolve3);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: [dataToResolve1, dataToResolve2, dataToResolve3]
                    }
                ]);
            });
            it('if all of the promises were resolved before calling the method, should resolve', function () {
                var promiseToResolve1 = new index_1.PromiseMock();
                var promiseToResolve2 = new index_1.PromiseMock();
                var promiseToResolve3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var dataToResolve3 = {};
                promiseToResolve1.resolve(dataToResolve1);
                promiseToResolve2.resolve(dataToResolve2);
                promiseToResolve3.resolve(dataToResolve3);
                index_1.PromiseMock.all([promiseToResolve1, promiseToResolve2, promiseToResolve3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: [dataToResolve1, dataToResolve2, dataToResolve3]
                    }
                ]);
            });
            it('if one of the promises was rejected before calling the method, should reject', function () {
                var pendingPromise1 = new index_1.PromiseMock();
                var pendingPromise2 = new index_1.PromiseMock();
                var promiseToReject = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error = {};
                promiseToReject.reject(error);
                index_1.PromiseMock.all([pendingPromise1, promiseToReject, pendingPromise2]).catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error
                    }
                ]);
            });
            it('if all the promises were rejected before calling the method, should reject', function () {
                var promiseToReject1 = new index_1.PromiseMock();
                var promiseToReject2 = new index_1.PromiseMock();
                var promiseToReject3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error1 = {};
                var error2 = {};
                var error3 = {};
                promiseToReject1.reject(error1);
                promiseToReject2.reject(error2);
                promiseToReject3.reject(error3);
                index_1.PromiseMock.all([promiseToReject1, promiseToReject3, promiseToReject2]).catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    }
                ]);
            });
            it('if one of the passed objects is not a promise, should return its value on success', function () {
                var promiseToResolve1 = new index_1.PromiseMock();
                var promiseToResolve2 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var otherData = {};
                index_1.PromiseMock.all([promiseToResolve1, otherData, promiseToResolve2]).success(successCallback);
                promiseToResolve1.resolve(dataToResolve1);
                promiseToResolve2.resolve(dataToResolve2);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: [dataToResolve1, otherData, dataToResolve2]
                    }
                ]);
            });
            it('if all of the passed objects are not promises, should resolve and return the values on success', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var data1 = {};
                var data2 = {};
                var data3 = {};
                index_1.PromiseMock.all([data1, data2, data3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: [data1, data2, data3]
                    }
                ]);
            });
            it('if one of the passed objects is null or undefined, should resolve and return the values on success', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var data1 = undefined;
                var data2 = null;
                var data3 = {};
                index_1.PromiseMock.all([data1, data2, data3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: [data1, data2, data3]
                    }
                ]);
            });
            it('if the passed promises array is null or undefined, should throw error', function () {
                var actionNull = function () { return index_1.PromiseMock.all(null); };
                var actionUndefined = function () { return index_1.PromiseMock.all(undefined); };
                chai_1.expect(actionNull).to.throw(Error);
                chai_1.expect(actionUndefined).to.throw(Error);
            });
            it('if empty array is passed, should resolve coorectly', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                index_1.PromiseMock.all([]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: []
                    }
                ]);
            });
        });
        describe('race', function () {
            it('if passed unresolved promises, should return a promise in pending state', function () {
                var promise = index_1.PromiseMock.race([new index_1.PromiseMock()]);
                chai_1.expect(promise.state).to.be.eq(index_1.PromiseState.Pending);
            });
            it('if only one of the promises is resolved, should resolve', function () {
                var promiseToResolve = new index_1.PromiseMock();
                var pendingPromise = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve = {};
                index_1.PromiseMock.race([promiseToResolve, pendingPromise]).success(successCallback);
                promiseToResolve.resolve(dataToResolve);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve
                    }
                ]);
            });
            it('if one of the promises rejects, should reject correctly', function () {
                var pendingPromise1 = new index_1.PromiseMock();
                var pendingPromise2 = new index_1.PromiseMock();
                var promiseToReject = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error = {};
                index_1.PromiseMock.race([pendingPromise1, promiseToReject, pendingPromise2]).catch(failureCallback);
                promiseToReject.reject(error);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error
                    }
                ]);
            });
            it('if all the promises reject, should reject correctly', function () {
                var promiseToReject1 = new index_1.PromiseMock();
                var promiseToReject2 = new index_1.PromiseMock();
                var promiseToReject3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error1 = {};
                var error2 = {};
                var error3 = {};
                index_1.PromiseMock.race([promiseToReject1, promiseToReject3, promiseToReject2]).catch(failureCallback);
                promiseToReject2.reject(error2);
                promiseToReject1.reject(error1);
                promiseToReject3.reject(error3);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error2
                    }
                ]);
            });
            it('if all of the promises resolve, should resolve correctly', function () {
                var promiseToResolve1 = new index_1.PromiseMock();
                var promiseToResolve2 = new index_1.PromiseMock();
                var promiseToResolve3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var dataToResolve3 = {};
                index_1.PromiseMock.race([promiseToResolve1, promiseToResolve2, promiseToResolve3]).success(successCallback);
                promiseToResolve1.resolve(dataToResolve1);
                promiseToResolve2.resolve(dataToResolve2);
                promiseToResolve3.resolve(dataToResolve3);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve1
                    }
                ]);
            });
            it('if all of the promises were resolved before calling the method, should resolve correctly', function () {
                var promiseToResolve1 = new index_1.PromiseMock();
                var promiseToResolve2 = new index_1.PromiseMock();
                var promiseToResolve3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var dataToResolve3 = {};
                promiseToResolve1.resolve(dataToResolve1);
                promiseToResolve2.resolve(dataToResolve2);
                promiseToResolve3.resolve(dataToResolve3);
                index_1.PromiseMock.race([promiseToResolve1, promiseToResolve2, promiseToResolve3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: dataToResolve1
                    }
                ]);
            });
            it('if one of the promises was rejected before calling the method, should reject', function () {
                var pendingPromise1 = new index_1.PromiseMock();
                var pendingPromise2 = new index_1.PromiseMock();
                var promiseToReject = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error = {};
                promiseToReject.reject(error);
                index_1.PromiseMock.race([pendingPromise1, promiseToReject, pendingPromise2]).catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error
                    }
                ]);
            });
            it('if all the promises were rejected before calling the method, should reject', function () {
                var promiseToReject1 = new index_1.PromiseMock();
                var promiseToReject2 = new index_1.PromiseMock();
                var promiseToReject3 = new index_1.PromiseMock();
                var callbackRecords = [];
                var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);
                var error1 = {};
                var error2 = {};
                var error3 = {};
                promiseToReject1.reject(error1);
                promiseToReject2.reject(error2);
                promiseToReject3.reject(error3);
                index_1.PromiseMock.race([promiseToReject1, promiseToReject3, promiseToReject2]).catch(failureCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Failure,
                        callbackNumber: 1,
                        data: error1
                    }
                ]);
            });
            it('if one of the passed objects is not a promise, should return its value on success', function () {
                var pendeingPromise1 = new index_1.PromiseMock();
                var pendingPromise2 = new index_1.PromiseMock();
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var dataToResolve1 = {};
                var dataToResolve2 = {};
                var otherData = {};
                index_1.PromiseMock.race([pendeingPromise1, otherData, pendingPromise2]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: otherData
                    }
                ]);
            });
            it('if all of the passed objects are not promises, should resolve and return the first value on success', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var data1 = {};
                var data2 = {};
                var data3 = {};
                index_1.PromiseMock.race([data1, data2, data3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    }
                ]);
            });
            it('if one of the passed objects is null or undefined, should resolve and return the first value on success', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                var data1 = undefined;
                var data2 = null;
                var data3 = {};
                index_1.PromiseMock.race([data1, data2, data3]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: data1
                    }
                ]);
            });
            it('if the passed promises array is null or undefined, should throw error', function () {
                var actionNull = function () { return index_1.PromiseMock.race(null); };
                var actionUndefined = function () { return index_1.PromiseMock.race(undefined); };
                chai_1.expect(actionNull).to.throw(Error);
                chai_1.expect(actionUndefined).to.throw(Error);
            });
            it('if empty array is passed, should resolve coorectly', function () {
                var callbackRecords = [];
                var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);
                index_1.PromiseMock.race([]).success(successCallback);
                chai_1.expect(callbackRecords).to.be.eql([
                    {
                        type: CallbackType.Success,
                        callbackNumber: 1,
                        data: undefined
                    }
                ]);
            });
        });
        describe('state', function () {
            it('setting state should throw exception', function () {
                var setAction = function () { return promiseMock.state = index_1.PromiseState.Pending; };
                chai_1.expect(setAction).to.throw();
            });
        });
    });
})(Tests || (Tests = {}));
