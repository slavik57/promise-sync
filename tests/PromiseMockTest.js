"use strict";
var chai_1 = require('chai');
var PromiseState_1 = require('../src/enums/PromiseState');
var PromiseMock_1 = require('../src/PromiseMock');
describe('PromiseMock', function () {
    var promiseMock;
    function createCallback(callbackNumber, callbacks, dataToReturn) {
        return function (_data) {
            callbacks.push({
                callbackNumber: callbackNumber,
                data: _data
            });
            if (dataToReturn !== null &&
                dataToReturn !== undefined) {
                return dataToReturn;
            }
        };
    }
    function createThrowsCallback(callbackNumber, callbacks, errorToThrow) {
        return function (_data) {
            callbacks.push({
                callbackNumber: callbackNumber,
                data: _data
            });
            if (errorToThrow !== null &&
                errorToThrow !== undefined) {
                throw errorToThrow;
            }
        };
    }
    beforeEach(function () {
        promiseMock = new PromiseMock_1.PromiseMock();
    });
    describe('constructor', function () {
        it('constructor - should initialize state correctly', function () {
            var promiseMock = new PromiseMock_1.PromiseMock();
            chai_1.expect(promiseMock.state).to.equal(PromiseState_1.PromiseState.Pending);
        });
    });
    describe('resolve', function () {
        it('resove - resolve should set the state to resolved', function () {
            promiseMock.resolve();
            chai_1.expect(promiseMock.state).to.equal(PromiseState_1.PromiseState.Resolved);
        });
        it('resove - resolve twice should fail', function () {
            promiseMock.resolve();
            chai_1.expect(function () { return promiseMock.resolve(); }).to.throw(Error);
        });
        it('resove - calling resolve after reject should fail', function () {
            promiseMock.reject();
            chai_1.expect(function () { return promiseMock.resolve(); }).to.throw(Error);
        });
    });
    describe('reject', function () {
        it('reject - reject should set the state to rejected', function () {
            promiseMock.reject();
            chai_1.expect(promiseMock.state).to.equal(PromiseState_1.PromiseState.Rejected);
        });
        it('reject - reject twice should not fail and set as rejected', function () {
            promiseMock.reject();
            chai_1.expect(function () { return promiseMock.reject(); }).to.throw(Error);
        });
        it('reject - calling reject after resolve should fail', function () {
            promiseMock.resolve();
            chai_1.expect(function () { return promiseMock.reject(); }).to.throw(Error);
        });
    });
    describe('seccuess', function () {
        it('success - should return new promise', function () {
            var result = promiseMock.success(function () { });
            chai_1.expect(result).not.to.be.equal(promiseMock);
        });
        it('success - resolving should call all the callbacks', function () {
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
        it('success - rejecting should not call the callbacks', function () {
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
        it('success - resolve and then register success callback, should call the callback', function () {
            var numberOfTimesCalled = 0;
            var callback = function () { return numberOfTimesCalled++; };
            promiseMock.resolve();
            promiseMock.success(callback);
            chai_1.expect(numberOfTimesCalled).to.be.equal(1);
        });
        it('success - resolving with data should call all the callbacks with correct data', function () {
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
        it('success - resolve with data and then register success callback, should call the callback with correct data', function () {
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
        it('success - callback throws error should still call other callbacks', function () {
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
        it('success - register to success on the returned promise, resolve, should call the next callback', function () {
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
        it('success - register to success on the returned promise, resolve with data, should call the next callback with correct data', function () {
            var data1 = 11;
            var data2 = 12;
            var data3 = 13;
            var data4 = 14;
            var callbackRecords = [];
            promiseMock.success(createCallback(1, callbackRecords, data2))
                .success(createCallback(2, callbackRecords, data3))
                .success(createCallback(3, callbackRecords, data4))
                .success(createCallback(4, callbackRecords));
            promiseMock.resolve(data1);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: data1
                },
                {
                    callbackNumber: 2,
                    data: data2
                },
                {
                    callbackNumber: 3,
                    data: data3
                },
                {
                    callbackNumber: 4,
                    data: data4
                }]);
        });
        it('success - register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next callback with correct data', function () {
            var data1 = 11;
            var data2 = 13;
            var callbackRecords = [];
            promiseMock.success(createCallback(1, callbackRecords))
                .success(createCallback(2, callbackRecords))
                .success(createCallback(3, callbackRecords, data2))
                .success(createCallback(4, callbackRecords));
            promiseMock.resolve(data1);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: data1
                },
                {
                    callbackNumber: 2,
                    data: undefined
                },
                {
                    callbackNumber: 3,
                    data: undefined
                },
                {
                    callbackNumber: 4,
                    data: data2
                }]);
        });
        it('success - register to success on the returned promise, reject with error, should not call the next success callback', function () {
            var error = 'error';
            var callbackRecords = [];
            promiseMock.success(createCallback(1, callbackRecords))
                .success(createCallback(2, callbackRecords));
            promiseMock.reject(error);
            chai_1.expect(callbackRecords).to.be.eql([]);
        });
        it('success - register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback', function () {
            var data = 'data';
            var error = 'error';
            var callbackRecords = [];
            promiseMock.success(function () { throw error; })
                .success(createCallback(1, callbackRecords));
            promiseMock.resolve(data);
            chai_1.expect(callbackRecords).to.be.eql([]);
        });
        it('success - register to success on the returned promise, resolve with data, promises return promise, should call the next callbacks with correct data', function () {
            var data1 = 11;
            var data2 = 12;
            var data3 = 13;
            var data4 = 14;
            var returnedPromise1 = new PromiseMock_1.PromiseMock();
            var returnedPromise2 = new PromiseMock_1.PromiseMock();
            var returnedPromise3 = new PromiseMock_1.PromiseMock();
            var callbackRecords = [];
            promiseMock.success(createCallback(1, callbackRecords, returnedPromise1))
                .success(createCallback(2, callbackRecords, returnedPromise2))
                .success(createCallback(3, callbackRecords, returnedPromise3))
                .success(createCallback(4, callbackRecords));
            promiseMock.resolve(data1);
            returnedPromise1.resolve(data2);
            returnedPromise2.resolve(data3);
            returnedPromise3.resolve(data4);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: data1
                },
                {
                    callbackNumber: 2,
                    data: data2
                },
                {
                    callbackNumber: 3,
                    data: data3
                },
                {
                    callbackNumber: 4,
                    data: data4
                }]);
        });
        it('success - register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', function () {
            var data = 'data';
            var error = 'error';
            var callbackRecords = [];
            promiseMock.success(createThrowsCallback(1, callbackRecords, error))
                .catch(createCallback(2, callbackRecords));
            promiseMock.resolve(data);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: data
                },
                {
                    callbackNumber: 2,
                    data: error
                }
            ]);
        });
        it('success - register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should call the next callbacks with correct errors', function () {
            var data1 = 11;
            var error1 = 12;
            var error2 = 13;
            var error3 = 14;
            var returnedPromise = new PromiseMock_1.PromiseMock();
            var callbackRecords = [];
            promiseMock.success(createCallback(1, callbackRecords, returnedPromise))
                .catch(createThrowsCallback(2, callbackRecords, error2))
                .catch(createThrowsCallback(3, callbackRecords, error3))
                .catch(createCallback(4, callbackRecords));
            promiseMock.resolve(data1);
            returnedPromise.reject(error1);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: data1
                },
                {
                    callbackNumber: 2,
                    data: error1
                },
                {
                    callbackNumber: 3,
                    data: error2
                },
                {
                    callbackNumber: 4,
                    data: error3
                }]);
        });
    });
    describe('catch', function () {
        it('catch - should return new promise', function () {
            var result = promiseMock.catch(function () { });
            chai_1.expect(result).not.to.be.equal(promiseMock);
        });
        it('catch - rejecting should call all the callbacks', function () {
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
        it('catch - resolving should not call the callbacks', function () {
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
        it('catch - reject and then register catch callback, should call the callback', function () {
            var numberOfTimesCalled = 0;
            var callback = function () { return numberOfTimesCalled++; };
            promiseMock.reject();
            promiseMock.catch(callback);
            chai_1.expect(numberOfTimesCalled).to.be.equal(1);
        });
        it('catch - rejecting with error should call all the callbacks with correct error', function () {
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
        it('catch - reject with error and then register catch callback, should call the callback with correct error', function () {
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
        it('catch - callback throws error should still call other callbacks', function () {
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
        it('catch - register to catch on the returned promise, reject, should not call the next callback', function () {
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
        it('catch - register to catch on the returned promise, reject with error, should not call the next callbacks ', function () {
            var error1 = 11;
            var callbackRecords = [];
            promiseMock.catch(createCallback(1, callbackRecords))
                .catch(createCallback(2, callbackRecords))
                .catch(createCallback(3, callbackRecords))
                .catch(createCallback(4, callbackRecords));
            promiseMock.reject(error1);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: error1
                }]);
        });
        it('catch - register to catch on the returned promise, resolve with data, should not call the next catch callback', function () {
            var data = 'data';
            var callbackRecords = [];
            promiseMock.catch(createCallback(1, callbackRecords))
                .catch(createCallback(2, callbackRecords));
            promiseMock.resolve(data);
            chai_1.expect(callbackRecords).to.be.eql([]);
        });
        it('catch - register to catch on the returned promise, reject with error, callback throws error, should call the next catch callback', function () {
            var error1 = 'error1';
            var error2 = 'error2';
            var error3 = 'error3';
            var error4 = 'error4';
            var callbackRecords = [];
            promiseMock.catch(createThrowsCallback(1, callbackRecords, error2))
                .catch(createThrowsCallback(2, callbackRecords, error3))
                .catch(createThrowsCallback(3, callbackRecords, error4))
                .catch(createThrowsCallback(4, callbackRecords));
            promiseMock.reject(error1);
            chai_1.expect(callbackRecords).to.be.eql([
                {
                    callbackNumber: 1,
                    data: error1
                },
                {
                    callbackNumber: 2,
                    data: error2
                },
                {
                    callbackNumber: 3,
                    data: error3
                },
                {
                    callbackNumber: 4,
                    data: error4
                }
            ]);
        });
    });
});
