"use strict";
var chai_1 = require('chai');
var PromiseState_1 = require('../src/enums/PromiseState');
var PromiseMock_1 = require('../src/PromiseMock');
describe('PromiseMock', function () {
    var promiseMock;
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
});
