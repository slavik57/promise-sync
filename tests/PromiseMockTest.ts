import { expect, AssertionError } from 'chai';
import * as sinon from 'sinon';
import {PromiseState, PromiseMock} from '../index';

PromiseMock.setAssertionExceptionTypes([AssertionError]);

module Tests {
  enum CallbackType {
    Success,
    Failure
  }

  interface ICallbackRecord {
    type: CallbackType;
    callbackNumber: number;
    data: any;
  }

  describe('PromiseMock', () => {
    var promiseMock: PromiseMock<any>;

    function createCallback(callbackType: CallbackType, callbackNumber: number, callbacks: ICallbackRecord[], dataToReturn?: any) {
      return (_data) => {
        callbacks.push({
          type: callbackType,
          callbackNumber: callbackNumber,
          data: _data
        });

        if (dataToReturn !== null &&
          dataToReturn !== undefined) {
          return dataToReturn;
        }
      }
    }

    function createThrowsCallback(callbackType: CallbackType, callbackNumber: number, callbacks: ICallbackRecord[], errorToThrow?: any) {
      return (_data) => {
        callbacks.push({
          type: callbackType,
          callbackNumber: callbackNumber,
          data: _data
        });

        if (errorToThrow !== null &&
          errorToThrow !== undefined) {
          throw errorToThrow;
        }
      }
    }

    beforeEach(() => {
      promiseMock = new PromiseMock<any>();
    })

    describe('constructor', () => {
      it('constructor - should initialize state correctly', () => {
        // Act
        var promiseMock = new PromiseMock();

        // Assert
        expect(promiseMock.state).to.equal(PromiseState.Pending);
      });

      it('constructor - should initialize isFulfilled correctly', () => {
        // Act
        var promiseMock = new PromiseMock();

        // Assert
        expect(promiseMock.isFulfilled()).to.equal(false);
      });

      it('constructor - should initialize isRejected correctly', () => {
        // Act
        var promiseMock = new PromiseMock();

        // Assert
        expect(promiseMock.isRejected()).to.equal(false);
      });

      it('constructor - should initialize isPending correctly', () => {
        // Act
        var promiseMock = new PromiseMock();

        // Assert
        expect(promiseMock.isPending()).to.equal(true);
      });
    });

    describe('resolve', () => {
      it('resove - resolve should set the state to resolved', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(promiseMock.state).to.equal(PromiseState.Fulfilled);
      });

      it('resove - isFulfilled should be true', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(promiseMock.isFulfilled()).to.equal(true);
      });

      it('resove - isRejected should be false', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(promiseMock.isRejected()).to.equal(false);
      });

      it('resove - isPending should be false', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(promiseMock.isPending()).to.equal(false);
      });

      it('resove - resolve twice should fail', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(() => promiseMock.resolve()).to.throw(Error);
      });

      it('resove - calling resolve after reject should fail', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(() => promiseMock.resolve()).to.throw(Error);
      });
    });

    describe('reject', () => {
      it('reject - reject should set the state to rejected', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(promiseMock.state).to.equal(PromiseState.Rejected);
      });

      it('reject - reject should set isFulfilled to false', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(promiseMock.isFulfilled()).to.equal(false);
      });

      it('reject - reject should set isPending to false', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(promiseMock.isPending()).to.equal(false);
      });

      it('reject - reject should set isRejected to false', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(promiseMock.isRejected()).to.equal(true);
      });

      it('reject - reject twice should not fail and set as rejected', () => {
        // Act
        promiseMock.reject();

        // Assert
        expect(() => promiseMock.reject()).to.throw(Error);
      });

      it('reject - calling reject after resolve should fail', () => {
        // Act
        promiseMock.resolve();

        // Assert
        expect(() => promiseMock.reject()).to.throw(Error);
      });
    });

    describe('seccuess', () => {
      it('success - should return new promise', () => {
        // Act
        var result: PromiseMock<any> = promiseMock.success(() => { });

        // Assert
        expect(result).not.to.be.equal(promiseMock);
        expect(result).not.to.be.null;
      });

      it('success - resolving should call all the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.success(callback1);
        promiseMock.success(callback2);
        promiseMock.success(callback3);
        promiseMock.success(callback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('success - rejecting should not call the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.success(callback1);
        promiseMock.success(callback2);
        promiseMock.success(callback3);
        promiseMock.success(callback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(0);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('success - resolve and then register success callback, should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var callback = () => numberOfTimesCalled++;

        // Act
        promiseMock.resolve();
        promiseMock.success(callback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('success - resolving with data should call all the callbacks with correct data', () => {
        // Arrange
        var data = {};

        var numberOfTimesCalled1 = 0;
        var callback1 = (_data) => {
          numberOfTimesCalled1++;
          expect(_data).to.be.equal(data);
        }

        var numberOfTimesCalled2 = 0;
        var callback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(data);
        }

        promiseMock.success(callback1);
        promiseMock.success(callback2);

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('success - resolve with data and then register success callback, should call the callback with correct data', () => {
        // Arrange
        var data = {};

        var numberOfTimesCalled = 0;
        var callback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(data);
        }

        // Act
        promiseMock.resolve(data);
        promiseMock.success(callback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('success - callback throws error should still call other callbacks', () => {
        // Arrange
        var callback1 = () => { throw ''; }

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.success(callback1);
        promiseMock.success(callback2);
        promiseMock.success(callback3);
        promiseMock.success(callback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('success - register to success on the returned promise, resolve, should call the next callback', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.success(callback1)
          .success(callback2)
          .success(callback3)
          .success(callback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('success - register to success on the returned promise, resolve with data, should call the next callback with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 12;
        var data3 = 13;
        var data4 = 14;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, data2))
          .success(createCallback(CallbackType.Success, 2, callbackRecords, data3))
          .success(createCallback(CallbackType.Success, 3, callbackRecords, data4))
          .success(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);

        // Assert
        expect(callbackRecords).to.be.eql([
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
          }]);
      });

      it('success - register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next callback with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 13;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords))
          .success(createCallback(CallbackType.Success, 2, callbackRecords))
          .success(createCallback(CallbackType.Success, 3, callbackRecords, data2))
          .success(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);

        // Assert
        expect(callbackRecords).to.be.eql([
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
          }]);
      });

      it('success - register to success on the returned promise, reject with error, should not call the next success callback', () => {
        // Arrange
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords))
          .success(createCallback(CallbackType.Success, 2, callbackRecords));

        // Act
        promiseMock.reject(error);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('success - register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(() => { throw error; })
          .success(createCallback(CallbackType.Success, 1, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('success - register to success on the returned promise, resolve with data, promises return promise, should call the next callbacks with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 12;
        var data3 = 13;
        var data4 = 14;

        var returnedPromise1 = new PromiseMock<any>();
        var returnedPromise2 = new PromiseMock<any>();
        var returnedPromise3 = new PromiseMock<any>();

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise1))
          .success(createCallback(CallbackType.Success, 2, callbackRecords, returnedPromise2))
          .success(createCallback(CallbackType.Success, 3, callbackRecords, returnedPromise3))
          .success(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);
        returnedPromise1.resolve(data2);
        returnedPromise2.resolve(data3);
        returnedPromise3.resolve(data4);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 2,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 4,
            data: data1
          }]);
      });

      it('success - register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
          .catch(createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('success - register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should not call the next callbacks', () => {
        // Arrange
        var data1 = 11;
        var error1 = 12;
        var error2 = 13;
        var error3 = 14;

        var returnedPromise = new PromiseMock<any>();

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.success(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise))
          .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
          .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
          .catch(createCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);
        returnedPromise.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: data1
          }]);
      });

      it('success - register success, resolve promise, register another success, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var successCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.success(successCallback);
        promiseMock.resolve();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.success(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });
    });

    describe('catch', () => {
      it('catch - should return new promise', () => {
        // Act
        var result: PromiseMock<any> = promiseMock.catch(() => { });

        // Assert
        expect(result).not.to.be.equal(promiseMock);
        expect(result).not.to.be.null;
      });

      it('catch - rejecting should call all the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.catch(callback1);
        promiseMock.catch(callback2);
        promiseMock.catch(callback3);
        promiseMock.catch(callback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('catch - resolving should not call the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.catch(callback1);
        promiseMock.catch(callback2);
        promiseMock.catch(callback3);
        promiseMock.catch(callback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(0);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('catch - reject and then register catch callback, should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var callback = () => numberOfTimesCalled++;

        // Act
        promiseMock.reject();
        promiseMock.catch(callback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('catch - rejecting with error should call all the callbacks with correct error', () => {
        // Arrange
        var error = {};

        var numberOfTimesCalled1 = 0;
        var callback1 = (_data) => {
          numberOfTimesCalled1++;
          expect(_data).to.be.equal(error);
        }

        var numberOfTimesCalled2 = 0;
        var callback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(error);
        }

        promiseMock.catch(callback1);
        promiseMock.catch(callback2);

        // Act
        promiseMock.reject(error);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('catch - reject with error and then register catch callback, should call the callback with correct error', () => {
        // Arrange
        var error = {};

        var numberOfTimesCalled = 0;
        var callback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(error);
        }

        // Act
        promiseMock.reject(error);
        promiseMock.catch(callback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('catch - callback throws error should still call other callbacks', () => {
        // Arrange
        var callback1 = () => { throw ''; }

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.catch(callback1);
        promiseMock.catch(callback2);
        promiseMock.catch(callback3);
        promiseMock.catch(callback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('catch - register to catch on the returned promise, reject, should not call the next callback', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.catch(callback1)
          .catch(callback2)
          .catch(callback3)
          .catch(callback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('catch - register to catch on the returned promise, reject with error, should not call the next callbacks ', () => {
        // Arrange
        var error1 = 11;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.catch(createCallback(CallbackType.Failure, 1, callbackRecords))
          .catch(createCallback(CallbackType.Failure, 2, callbackRecords))
          .catch(createCallback(CallbackType.Failure, 3, callbackRecords))
          .catch(createCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 1,
            data: error1
          }]);
      });

      it('catch - register to catch on the returned promise, resolve with data, should not call the next catch callback', () => {
        // Arrange
        var data = 'data';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.catch(createCallback(CallbackType.Failure, 1, callbackRecords))
          .catch(createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('catch - register to catch on the returned promise, reject with error, callback throws error, should call the next catch callback', () => {
        // Arrange
        var error1 = 'error1';
        var error2 = 'error2';
        var error3 = 'error3';
        var error4 = 'error4';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.catch(createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
          .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
          .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
          .catch(createThrowsCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
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

        it('catch - register catch, reject promise, register another catch, should not call first callback on the second time', () => {
          // Arrange
          var numberOfTimesCalled = 0;
          var catchCallback = () => numberOfTimesCalled++;

          // Act
          promiseMock.catch(catchCallback);
          promiseMock.reject();

          expect(numberOfTimesCalled).to.be.equal(1);

          promiseMock.catch(() => { });

          // Assert
          expect(numberOfTimesCalled).to.be.equal(1);
        });
      });
    });

    describe('then', () => {
      it('then - should return new promise', () => {
        // Act
        var result: PromiseMock<any> = promiseMock.then(() => { });

        // Assert
        expect(result).not.to.be.equal(promiseMock);
        expect(result).not.to.be.null;
      });

      it('then - resolving should call all the success callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var successCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var successCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var successCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var successCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(successCallback1);
        promiseMock.then(successCallback2);
        promiseMock.then(successCallback3);
        promiseMock.then(successCallback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('then - rejecting should not call the success callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var successCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var successCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var successCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var successCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(successCallback1);
        promiseMock.then(successCallback2);
        promiseMock.then(successCallback3);
        promiseMock.then(successCallback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(0);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('then - resolve and then register with success callback, should call the success callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var successCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.resolve();
        promiseMock.then(successCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - resolving with data should call all the success callbacks with correct data', () => {
        // Arrange
        var data = {};

        var numberOfTimesCalled1 = 0;
        var successCallback1 = (_data) => {
          numberOfTimesCalled1++;
          expect(_data).to.be.equal(data);
        }

        var numberOfTimesCalled2 = 0;
        var successCallback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(data);
        }

        promiseMock.then(successCallback1);
        promiseMock.then(successCallback2);

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('then - resolve with data and then register success callback, should call the success callback with correct data', () => {
        // Arrange
        var data = {};

        var numberOfTimesCalled = 0;
        var successCallback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(data);
        }

        // Act
        promiseMock.resolve(data);
        promiseMock.then(successCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - success callback throws error should still call other success callbacks', () => {
        // Arrange
        var throwingSuccessCallback = () => { throw ''; }

        var numberOfTimesCalled1 = 0;
        var successCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var successCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var successCallback3 = () => numberOfTimesCalled3++;

        promiseMock.then(throwingSuccessCallback);
        promiseMock.then(successCallback1);
        promiseMock.then(successCallback2);
        promiseMock.then(successCallback3);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
      });

      it('then - register to success on the returned promise, resolve, should call the next success callback', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var successCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var successCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var successCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var successCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(successCallback1)
          .then(successCallback2)
          .then(successCallback3)
          .then(successCallback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('then - register to success on the returned promise, resolve with data, should call the next success callback with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 12;
        var data3 = 13;
        var data4 = 14;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, data2))
          .then(createCallback(CallbackType.Success, 2, callbackRecords, data3))
          .then(createCallback(CallbackType.Success, 3, callbackRecords, data4))
          .then(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);

        // Assert
        expect(callbackRecords).to.be.eql([
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
          }]);
      });

      it('then - register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next success callback with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 13;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
          .then(createCallback(CallbackType.Success, 2, callbackRecords))
          .then(createCallback(CallbackType.Success, 3, callbackRecords, data2))
          .then(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);

        // Assert
        expect(callbackRecords).to.be.eql([
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
          }]);
      });

      it('then - register to success on the returned promise, reject with error, should not call the next success callback given in then', () => {
        // Arrange
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
          .then(createCallback(CallbackType.Success, 2, callbackRecords));

        // Act
        promiseMock.reject(error);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to success on the returned promise, reject with error, should not call the next success callback', () => {
        // Arrange
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords))
          .success(createCallback(CallbackType.Success, 2, callbackRecords));

        // Act
        promiseMock.reject(error);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { throw error; })
          .success(createCallback(CallbackType.Success, 1, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to success on the returned promise, resolve with data, first promise throws error, should not call the next success callback registered with then', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { throw error; })
          .then(createCallback(CallbackType.Success, 1, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to success on the returned promise, resolve with data, promises return promise, should call the next success callbacks with correct data', () => {
        // Arrange
        var data1 = 11;
        var data2 = 12;
        var data3 = 13;
        var data4 = 14;

        var returnedPromise1 = new PromiseMock<any>();
        var returnedPromise2 = new PromiseMock<any>();
        var returnedPromise3 = new PromiseMock<any>();

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise1))
          .then(createCallback(CallbackType.Success, 2, callbackRecords, returnedPromise2))
          .then(createCallback(CallbackType.Success, 3, callbackRecords, returnedPromise3))
          .then(createCallback(CallbackType.Success, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);
        returnedPromise1.resolve(data2);
        returnedPromise2.resolve(data3);
        returnedPromise3.resolve(data4);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 2,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: data1
          },
          {
            type: CallbackType.Success,
            callbackNumber: 4,
            data: data1
          }]);
      });

      it('then - register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
          .catch(createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then - register on error on the returned promise, resolve with data, success callback throws error, should call the next error callback registered with then', () => {
        // Arrange
        var data = 'data';
        var error = 'error';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createThrowsCallback(CallbackType.Success, 1, callbackRecords, error))
          .then(() => { }, createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then - register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should not call the next callbacks', () => {
        // Arrange
        var data1 = 11;
        var error1 = 12;
        var error2 = 13;
        var error3 = 14;

        var returnedPromise = new PromiseMock<any>();

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(createCallback(CallbackType.Success, 1, callbackRecords, returnedPromise))
          .then(() => { }, createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error2))
          .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error3))
          .catch(createCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.resolve(data1);
        returnedPromise.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: data1
          }]);
      });

      it('then - register then success, resolve promise, register another success, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var successCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.then(successCallback);
        promiseMock.resolve();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.success(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - register then success, resolve promise, register another then success, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var successCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.then(successCallback);
        promiseMock.resolve();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.then(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - register success, resolve promise, register another then success, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var successCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.success(successCallback);
        promiseMock.resolve();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.then(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - call with failure callback should return new promise', () => {
        // Act
        var result: PromiseMock<any> = promiseMock.then(() => { }, () => { });

        // Assert
        expect(result).not.to.be.equal(promiseMock);
        expect(result).not.to.be.null;
      });

      it('then - rejecting should call all the failure callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var failureCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var failureCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var failureCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(() => { }, failureCallback1);
        promiseMock.then(() => { }, failureCallback2);
        promiseMock.then(() => { }, failureCallback3);
        promiseMock.then(() => { }, failureCallback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('then - resolving should not call the failure callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var failureCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var failureCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var failureCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(() => { }, failureCallback1);
        promiseMock.then(() => { }, failureCallback2);
        promiseMock.then(() => { }, failureCallback3);
        promiseMock.then(() => { }, failureCallback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(0);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('then - reject and then register with fail callback, should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var failureCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.reject();
        promiseMock.then(() => { }, failureCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - rejecting with error should call all the fail callbacks with correct error', () => {
        // Arrange
        var error = {};

        var numberOfTimesCalled1 = 0;
        var failureCallback1 = (_data) => {
          numberOfTimesCalled1++;
          expect(_data).to.be.equal(error);
        }

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(error);
        }

        promiseMock.then(() => { }, failureCallback1);
        promiseMock.then(() => { }, failureCallback2);

        // Act
        promiseMock.reject(error);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('then - reject with error and then register with failt callback, should call the fail callback with correct error', () => {
        // Arrange
        var error = {};

        var numberOfTimesCalled = 0;
        var failureCallback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(error);
        }

        // Act
        promiseMock.reject(error);
        promiseMock.then(() => { }, failureCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - failure callback throws error should still call other failure callbacks', () => {
        // Arrange
        var throwingErrorCallback = () => { throw ''; }

        var numberOfTimesCalled1 = 0;
        var failureCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var failureCallback3 = () => numberOfTimesCalled3++;

        promiseMock.then(() => { }, throwingErrorCallback);
        promiseMock.then(() => { }, failureCallback1);
        promiseMock.then(() => { }, failureCallback2);
        promiseMock.catch(failureCallback3);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
      });

      it('then - register to catch on the returned promise, reject, should not call the next callback', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var failureCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var failureCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var failureCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(() => { }, failureCallback1)
          .catch(failureCallback2)
          .catch(failureCallback3)
          .catch(failureCallback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('then - register to failure callback on the returned promise, reject, should not call the next failure callback', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var failureCallback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var failureCallback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var failureCallback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var failureCallback4 = () => numberOfTimesCalled4++;

        promiseMock.then(() => { }, failureCallback1)
          .then(() => { }, failureCallback2)
          .then(() => { }, failureCallback3)
          .then(() => { }, failureCallback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(0);
        expect(numberOfTimesCalled3).to.be.equal(0);
        expect(numberOfTimesCalled4).to.be.equal(0);
      });

      it('then - register to failure on the returned promise, reject with error, should not call the next callbacks ', () => {
        // Arrange
        var error1 = 11;

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { }, createCallback(CallbackType.Failure, 1, callbackRecords))
          .then(() => { }, createCallback(CallbackType.Failure, 2, callbackRecords))
          .then(() => { }, createCallback(CallbackType.Failure, 3, callbackRecords))
          .then(() => { }, createCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 1,
            data: error1
          }]);
      });

      it('then - register to catch on the returned promise, resolve with data, should not call the next catch callback', () => {
        // Arrange
        var data = 'data';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { }, createCallback(CallbackType.Failure, 1, callbackRecords))
          .catch(createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to failure callback on the returned promise, resolve with data, should not call the next catch callback', () => {
        // Arrange
        var data = 'data';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { }, createCallback(CallbackType.Failure, 1, callbackRecords))
          .then(() => { }, createCallback(CallbackType.Failure, 2, callbackRecords));

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('then - register to catch on the returned promise, reject with error, callback throws error, should call the next catch callback', () => {
        // Arrange
        var error1 = 'error1';
        var error2 = 'error2';
        var error3 = 'error3';
        var error4 = 'error4';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { }, createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
          .catch(createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
          .catch(createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
          .catch(createThrowsCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then - register to failure callback on the returned promise, reject with error, callback throws error, should call the next catch callback', () => {
        // Arrange
        var error1 = 'error1';
        var error2 = 'error2';
        var error3 = 'error3';
        var error4 = 'error4';

        var callbackRecords: ICallbackRecord[] = [];

        promiseMock.then(() => { }, createThrowsCallback(CallbackType.Failure, 1, callbackRecords, error2))
          .then(() => { }, createThrowsCallback(CallbackType.Failure, 2, callbackRecords, error3))
          .then(() => { }, createThrowsCallback(CallbackType.Failure, 3, callbackRecords, error4))
          .then(() => { }, createThrowsCallback(CallbackType.Failure, 4, callbackRecords));

        // Act
        promiseMock.reject(error1);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then - register catch, reject promise, register failure callback, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var catchCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.catch(catchCallback);
        promiseMock.reject();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.then(() => { }, () => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('then - register then, reject promise, register failure callback, should not call the failure callback on the second time', () => {
        // Arrange
        var numberOfTimesSuccessCallbackCalled = 0;
        var successCallback = () => numberOfTimesSuccessCallbackCalled++;
        var numberOfTimesFailureCallbackCalled = 0;
        var failureCallback = () => numberOfTimesFailureCallbackCalled++;

        // Act
        promiseMock.then(successCallback, failureCallback);
        promiseMock.reject();

        expect(numberOfTimesSuccessCallbackCalled).to.be.equal(0);
        expect(numberOfTimesFailureCallbackCalled).to.be.equal(1);

        promiseMock.then(() => { }, () => { });

        // Assert
        expect(numberOfTimesSuccessCallbackCalled).to.be.equal(0);
        expect(numberOfTimesFailureCallbackCalled).to.be.equal(1);
      });

      it('then - register then, resolve promise, register failure callback, should not call the success callback on the second time', () => {
        // Arrange
        var numberOfTimesSuccessCallbackCalled = 0;
        var successCallback = () => numberOfTimesSuccessCallbackCalled++;
        var numberOfTimesFailureCallbackCalled = 0;
        var failureCallback = () => numberOfTimesSuccessCallbackCalled++;

        // Act
        promiseMock.then(successCallback, failureCallback);
        promiseMock.resolve();

        expect(numberOfTimesSuccessCallbackCalled).to.be.equal(1);
        expect(numberOfTimesFailureCallbackCalled).to.be.equal(0);

        promiseMock.then(() => { }, () => { });

        // Assert
        expect(numberOfTimesSuccessCallbackCalled).to.be.equal(1);
        expect(numberOfTimesFailureCallbackCalled).to.be.equal(0);
      });
    });

    describe('finally', () => {
      it('finally - should return new promise', () => {
        // Act
        var result: PromiseMock<any> = promiseMock.finally(() => { });

        // Assert
        expect(result).not.to.be.equal(promiseMock);
        expect(result).not.to.be.null;
      });

      it('finally - resolving should call all the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.finally(callback1);
        promiseMock.finally(callback2);
        promiseMock.finally(callback3);
        promiseMock.finally(callback4);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('finally - rejecting should call all the callbacks', () => {
        // Arrange
        var numberOfTimesCalled1 = 0;
        var callback1 = () => numberOfTimesCalled1++;

        var numberOfTimesCalled2 = 0;
        var callback2 = () => numberOfTimesCalled2++;

        var numberOfTimesCalled3 = 0;
        var callback3 = () => numberOfTimesCalled3++;

        var numberOfTimesCalled4 = 0;
        var callback4 = () => numberOfTimesCalled4++;

        promiseMock.finally(callback1);
        promiseMock.finally(callback2);
        promiseMock.finally(callback3);
        promiseMock.finally(callback4);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
        expect(numberOfTimesCalled3).to.be.equal(1);
        expect(numberOfTimesCalled4).to.be.equal(1);
      });

      it('finally - resolve and then register finally callback, should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var callback = () => numberOfTimesCalled++;

        // Act
        promiseMock.resolve();
        promiseMock.finally(callback);

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - resolving with data should resolve the returned promise with same data', () => {
        // Arrange
        var data = {};

        var numberOfTimesCalled1 = 0;
        var callback1 = () => {
          numberOfTimesCalled1++;
        }

        var numberOfTimesCalled2 = 0;
        var callback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(data);
        }

        promiseMock.finally(callback1)
          .success(callback2);

        // Act
        promiseMock.resolve(data);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('finally - rejecting with error should reject the returned promise with same error', () => {
        // Arrange
        var error = {};

        var numberOfTimesCalled1 = 0;
        var callback1 = () => {
          numberOfTimesCalled1++;
        }

        var numberOfTimesCalled2 = 0;
        var callback2 = (_data) => {
          numberOfTimesCalled2++;
          expect(_data).to.be.equal(error);
        }

        promiseMock.finally(callback1)
          .catch(callback2);

        // Act
        promiseMock.reject(error);

        // Assert
        expect(numberOfTimesCalled1).to.be.equal(1);
        expect(numberOfTimesCalled2).to.be.equal(1);
      });

      it('finally - success callback throws error should still call the finally callback', () => {
        // Arrange
        var successCallback = () => { throw ''; }

        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        promiseMock.success(successCallback);
        promiseMock.finally(finallyCallback);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - catch callback throws error should still call the finally callback', () => {
        // Arrange
        var catchCallback = () => { throw ''; }

        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        promiseMock.catch(catchCallback);
        promiseMock.finally(finallyCallback);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - success callback throws error should still call the returned promise finally callback', () => {
        // Arrange
        var successCallback = () => { throw ''; }

        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        promiseMock.success(successCallback)
          .finally(finallyCallback);

        // Act
        promiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - catch callback throws error should still call the returned promise finally callback', () => {
        // Arrange
        var catchCallback = () => { throw ''; }

        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        promiseMock.catch(catchCallback)
          .finally(finallyCallback);

        // Act
        promiseMock.reject();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, resolve promise, register another finally, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.finally(finallyCallback);
        promiseMock.resolve();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.finally(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, reject promise, register another finally, should not call first callback on the second time', () => {
        // Arrange
        var numberOfTimesCalled = 0;
        var finallyCallback = () => numberOfTimesCalled++;

        // Act
        promiseMock.finally(finallyCallback);
        promiseMock.reject();

        expect(numberOfTimesCalled).to.be.equal(1);

        promiseMock.finally(() => { });

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, return promise from callback, register success after finally, the success will be called after the returned promise is resolved', () => {
        // Arrange
        var finallyReturnedPromiseMock = new PromiseMock<any>();
        var finallyCallback = () => finallyReturnedPromiseMock;

        var data = 111;

        var numberOfTimesCalled = 0;
        var successCallback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(data);
        }

        // Act
        promiseMock.finally(finallyCallback)
          .success(successCallback);

        promiseMock.resolve(data);
        expect(numberOfTimesCalled).to.be.equal(0);

        finallyReturnedPromiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, return promise from callback, register success after finally, the success will be called after the returned promise is rejected', () => {
        // Arrange
        var finallyReturnedPromiseMock = new PromiseMock<any>();
        var finallyCallback = () => finallyReturnedPromiseMock;

        var data = 111;

        var numberOfTimesCalled = 0;
        var successCallback = (_data) => {
          numberOfTimesCalled++;
          expect(_data).to.be.equal(data);
        }

        // Act
        promiseMock.finally(finallyCallback)
          .success(successCallback);

        promiseMock.resolve(data);
        expect(numberOfTimesCalled).to.be.equal(0);

        finallyReturnedPromiseMock.reject();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, return promise from callback, register catch after finally, the catch will be called after the returned promise is resolved', () => {
        // Arrange
        var finallyReturnedPromiseMock = new PromiseMock<any>();
        var finallyCallback = () => finallyReturnedPromiseMock;

        var error = 111;

        var numberOfTimesCalled = 0;
        var catchCallback = (_error) => {
          numberOfTimesCalled++;
          expect(_error).to.be.equal(error);
        }

        // Act
        promiseMock.finally(finallyCallback)
          .catch(catchCallback);

        promiseMock.reject(error);
        expect(numberOfTimesCalled).to.be.equal(0);

        finallyReturnedPromiseMock.resolve();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });

      it('finally - register finally, return promise from callback, register catch after finally, the catch will be called after the returned promise is rejected', () => {
        // Arrange
        var finallyReturnedPromiseMock = new PromiseMock<any>();
        var finallyCallback = () => finallyReturnedPromiseMock;

        var error = 111;

        var numberOfTimesCalled = 0;
        var catchCallback = (_error) => {
          numberOfTimesCalled++;
          expect(_error).to.be.equal(error);
        }

        // Act
        promiseMock.finally(finallyCallback)
          .catch(catchCallback);

        promiseMock.reject(error);
        expect(numberOfTimesCalled).to.be.equal(0);

        finallyReturnedPromiseMock.reject();

        // Assert
        expect(numberOfTimesCalled).to.be.equal(1);
      });
    });

    describe('integration', () => {
      it('then().then().then() - resolve, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.resolve(dataToResolve);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then().then().then() - reject, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.reject(errorToReject);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then().then().then() - resolve, first success callback throws arror, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.resolve(dataToResolve);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then().then().then() - reject, first failure callback throws arror, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.reject(errorToReject);

        // Assert
        expect(callbackRecords).to.be.eql([
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

      it('then().then().then() - resolve, first success callback returns promise, resolve the promise, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var promiseToReturn = new PromiseMock<any>();;
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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.resolve(dataToResolve);
        promiseToReturn.resolve(123);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: dataToResolve
          },
          {
            type: CallbackType.Success,
            callbackNumber: 2,
            data: dataToResolve
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: data2
          }
        ]);
      });

      it('then().then().then() - resolve, first success callback returns promise, reject the promise, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var promiseToReturn = new PromiseMock<any>();;
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

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.resolve(dataToResolve);
        promiseToReturn.reject(123);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: dataToResolve
          },
          {
            type: CallbackType.Success,
            callbackNumber: 2,
            data: dataToResolve
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: data2
          }
        ]);
      });

      it('then().then().then() - reject, first failure callback returns promise, resolve the promise, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var data1 = 'data1';
        var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);

        var data2 = 'data2';
        var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);

        var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);

        var promiseToReturn = new PromiseMock<any>();;
        var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, promiseToReturn);

        var error2 = 'error2';
        var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);

        var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);

        var errorToReject = 'errorToReject';

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.reject(errorToReject);
        promiseToReturn.resolve(123);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 4,
            data: errorToReject
          },
          {
            type: CallbackType.Failure,
            callbackNumber: 5,
            data: errorToReject
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: error2
          }
        ]);
      });

      it('then().then().then() - reject, first failure callback returns promise, reject the promise, should call correctly to callbacks', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var data1 = 'data1';
        var successCallback1 = createCallback(CallbackType.Success, 1, callbackRecords, data1);

        var data2 = 'data2';
        var successCallback2 = createCallback(CallbackType.Success, 2, callbackRecords, data2);

        var successCallback3 = createCallback(CallbackType.Success, 3, callbackRecords);

        var promiseToReturn = new PromiseMock<any>();;
        var failureCallback1 = createCallback(CallbackType.Failure, 4, callbackRecords, promiseToReturn);

        var error2 = 'error2';
        var failureCallback2 = createCallback(CallbackType.Failure, 5, callbackRecords, error2);

        var failureCallback3 = createCallback(CallbackType.Failure, 6, callbackRecords);

        var errorToReject = 'errorToReject';

        // Act
        promiseMock.then(successCallback1, failureCallback1)
          .then(successCallback2, failureCallback2)
          .then(successCallback3, failureCallback3);

        promiseMock.reject(errorToReject);
        promiseToReturn.reject(123);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 4,
            data: errorToReject
          },
          {
            type: CallbackType.Failure,
            callbackNumber: 5,
            data: errorToReject
          },
          {
            type: CallbackType.Success,
            callbackNumber: 3,
            data: error2
          }
        ]);
      });
    });

    describe('static resolve', () => {
      it('the returned promise state should be resolved', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(promise.state).to.equal(PromiseState.Fulfilled);
      });

      it('isFulfilled should be true', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(promise.isFulfilled()).to.equal(true);
      });

      it('isRejected should be false', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(promise.isRejected()).to.equal(false);
      });

      it('isPending should be false', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(promise.isPending()).to.equal(false);
      });

      it('call resolve should fail', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(() => promise.resolve()).to.throw(Error);
      });

      it('call reject should fail', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.resolve();

        // Assert
        expect(() => promise.reject()).to.throw(Error);
      });

      it('subscribing with then should call the success callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);

        var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);

        var dataToResolve = {};
        var promise: PromiseMock<any> = PromiseMock.resolve(dataToResolve);

        // Act
        promise.then(successCallback, failureCallback);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: dataToResolve
          }
        ]);
      });

      it('subscribing with success should call the success callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);

        var dataToResolve = {};
        var promise: PromiseMock<any> = PromiseMock.resolve(dataToResolve);

        // Act
        promise.success(successCallback);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Success,
            callbackNumber: 1,
            data: dataToResolve
          }
        ]);
      });

      it('subscribing with catch should not call the failure callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);

        var dataToResolve = {};
        var promise: PromiseMock<any> = PromiseMock.resolve(dataToResolve);

        // Act
        promise.catch(failureCallback);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('subscribing with finally should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;

        var finallyCallback = () => numberOfTimesCalled++

        var dataToResolve = {};
        var promise: PromiseMock<any> = PromiseMock.resolve(dataToResolve);

        // Act
        promise.finally(finallyCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.eql(1);
      });
    });

    describe('static reject', () => {
      it('the returned promise state should be rejected', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(promise.state).to.equal(PromiseState.Rejected);
      });

      it('isFulfilled should be false', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(promise.isFulfilled()).to.equal(false);
      });

      it('isRejected should be true', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(promise.isRejected()).to.equal(true);
      });

      it('isPending should be false', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(promise.isPending()).to.equal(false);
      });

      it('call resolve should fail', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(() => promise.resolve()).to.throw(Error);
      });

      it('call reject should fail', () => {
        // Act
        var promise: PromiseMock<any> = PromiseMock.reject();

        // Assert
        expect(() => promise.reject()).to.throw(Error);
      });

      it('subscribing with then should call the failure callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);

        var failureCallback = createCallback(CallbackType.Failure, 2, callbackRecords);

        var error = {};
        var promise: PromiseMock<any> = PromiseMock.reject(error);

        // Act
        promise.then(successCallback, failureCallback);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 2,
            data: error
          }
        ]);
      });

      it('subscribing with success should not call the success callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var successCallback = createCallback(CallbackType.Success, 1, callbackRecords);

        var error = {};
        var promise: PromiseMock<any> = PromiseMock.reject(error);

        // Act
        promise.success(successCallback);

        // Assert
        expect(callbackRecords).to.be.eql([]);
      });

      it('subscribing with catch should call the failure callback', () => {
        // Arrange
        var callbackRecords: ICallbackRecord[] = [];

        var failureCallback = createCallback(CallbackType.Failure, 1, callbackRecords);

        var error = {};
        var promise: PromiseMock<any> = PromiseMock.reject(error);

        // Act
        promise.catch(failureCallback);

        // Assert
        expect(callbackRecords).to.be.eql([
          {
            type: CallbackType.Failure,
            callbackNumber: 1,
            data: error
          }
        ]);
      });

      it('subscribing with finally should call the callback', () => {
        // Arrange
        var numberOfTimesCalled = 0;

        var finallyCallback = () => numberOfTimesCalled++;

        var error = {};
        var promise: PromiseMock<any> = PromiseMock.reject(error);

        // Act
        promise.finally(finallyCallback);

        // Assert
        expect(numberOfTimesCalled).to.be.eql(1);
      });
    });
  });
}
