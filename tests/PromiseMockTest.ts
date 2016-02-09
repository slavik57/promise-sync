import { expect } from 'chai';
import * as sinon from 'sinon';
import {PromiseState} from '../src/enums/PromiseState';
import {PromiseMock} from '../src/PromiseMock';

describe('PromiseMock', () => {
  var promiseMock: PromiseMock<any>;

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
});
