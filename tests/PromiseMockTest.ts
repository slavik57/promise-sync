import { expect } from 'chai';
import * as sinon from 'sinon';
import {PromiseState} from '../src/enums/PromiseState';
import {PromiseMock} from '../src/PromiseMock';

interface ICallbackRecord {
  callbackNumber: number;
  data: any;
}

describe('PromiseMock', () => {
  var promiseMock: PromiseMock<any>;

  function createCallback(callbackNumber: number, callbacks: ICallbackRecord[], dataToReturn?: any) {
    return (_data) => {
      callbacks.push({
        callbackNumber: callbackNumber,
        data: _data
      });

      if (dataToReturn !== null &&
        dataToReturn !== undefined) {
        return dataToReturn;
      }
    }
  }

  function createThrowsCallback(callbackNumber: number, callbacks: ICallbackRecord[], errorToThrow?: any) {
    return (_data) => {
      callbacks.push({
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
  });

  describe('resolve', () => {
    it('resove - resolve should set the state to resolved', () => {
      // Act
      promiseMock.resolve();

      // Assert
      expect(promiseMock.state).to.equal(PromiseState.Resolved);
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

      promiseMock.success(createCallback(1, callbackRecords, data2))
        .success(createCallback(2, callbackRecords, data3))
        .success(createCallback(3, callbackRecords, data4))
        .success(createCallback(4, callbackRecords));

      // Act
      promiseMock.resolve(data1);

      // Assert
      expect(callbackRecords).to.be.eql([
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

    it('success - register to success on the returned promise, resolve with data, some callbacks dont return nothing, should call the next callback with correct data', () => {
      // Arrange
      var data1 = 11;
      var data2 = 13;

      var callbackRecords: ICallbackRecord[] = [];

      promiseMock.success(createCallback(1, callbackRecords))
        .success(createCallback(2, callbackRecords))
        .success(createCallback(3, callbackRecords, data2))
        .success(createCallback(4, callbackRecords));

      // Act
      promiseMock.resolve(data1);

      // Assert
      expect(callbackRecords).to.be.eql([
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

    it('success - register to success on the returned promise, reject with error, should not call the next success callback', () => {
      // Arrange
      var error = 'error';

      var callbackRecords: ICallbackRecord[] = [];

      promiseMock.success(createCallback(1, callbackRecords))
        .success(createCallback(2, callbackRecords));

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
        .success(createCallback(1, callbackRecords));

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

      promiseMock.success(createCallback(1, callbackRecords, returnedPromise1))
        .success(createCallback(2, callbackRecords, returnedPromise2))
        .success(createCallback(3, callbackRecords, returnedPromise3))
        .success(createCallback(4, callbackRecords));

      // Act
      promiseMock.resolve(data1);
      returnedPromise1.resolve(data2);
      returnedPromise2.resolve(data3);
      returnedPromise3.resolve(data4);

      // Assert
      expect(callbackRecords).to.be.eql([
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

    it('success - register to catch on the returned promise, resolve with data, success callback throws error, should call the next catch callback', () => {
      // Arrange
      var data = 'data';
      var error = 'error';

      var callbackRecords: ICallbackRecord[] = [];

      promiseMock.success(createThrowsCallback(1, callbackRecords, error))
        .catch(createCallback(2, callbackRecords));

      // Act
      promiseMock.resolve(data);

      // Assert
      expect(callbackRecords).to.be.eql([
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

    it('success - register to catch on the returned promise, resolve with data, promises return promise that reject, catch callbacks throw erors, should call the next callbacks with correct errors', () => {
      // Arrange
      var data1 = 11;
      var error1 = 12;
      var error2 = 13;
      var error3 = 14;

      var returnedPromise = new PromiseMock<any>();

      var callbackRecords: ICallbackRecord[] = [];

      promiseMock.success(createCallback(1, callbackRecords, returnedPromise))
        .catch(createThrowsCallback(2, callbackRecords, error2))
        .catch(createThrowsCallback(3, callbackRecords, error3))
        .catch(createCallback(4, callbackRecords));

      // Act
      promiseMock.resolve(data1);
      returnedPromise.reject(error1);

      // Assert
      expect(callbackRecords).to.be.eql([
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

  describe('catch', () => {
    it('catch - should return new promise', () => {
      // Act
      var result: PromiseMock<any> = promiseMock.catch(() => { });

      // Assert
      expect(result).not.to.be.equal(promiseMock);
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

      promiseMock.catch(createCallback(1, callbackRecords))
        .catch(createCallback(2, callbackRecords))
        .catch(createCallback(3, callbackRecords))
        .catch(createCallback(4, callbackRecords));

      // Act
      promiseMock.reject(error1);

      // Assert
      expect(callbackRecords).to.be.eql([
        {
          callbackNumber: 1,
          data: error1
        }]);
    });

    it('catch - register to catch on the returned promise, resolve with data, should not call the next catch callback', () => {
      // Arrange
      var data = 'data';

      var callbackRecords: ICallbackRecord[] = [];

      promiseMock.catch(createCallback(1, callbackRecords))
        .catch(createCallback(2, callbackRecords));

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

      promiseMock.catch(createThrowsCallback(1, callbackRecords, error2))
        .catch(createThrowsCallback(2, callbackRecords, error3))
        .catch(createThrowsCallback(3, callbackRecords, error4))
        .catch(createThrowsCallback(4, callbackRecords));

      // Act
      promiseMock.reject(error1);

      // Assert
      expect(callbackRecords).to.be.eql([
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
