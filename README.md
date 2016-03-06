# promise-sync
Synchronous promise for making testing experience much easier.

## Installation
```
npm install promise-sync
```

## Why?
- Did you ever need to use setTimeout just to make sure the async logic
happened before you test the result?
- Do your tests run slowly because of long waits for async results?
- Have you ever tried to make a race condition test of 2 promises?
- Do you want to control the exact moment the promise reolves or rejects?

Well it all happened to me, so I searched for a library to make all of these
work as I want. All the results had a few things missing, some were async,
some didn't have the chaining, some threw errors if you didnt subscribe to them.

So I decided to write a new one.

## Who?
Well, it was developed by me using TDD and checking the behaviour of a real promise.

## Features
- Support callback subscription: ```success()```, ```catch()```, ```then()```, ```finally()```
- Chaining callback subscriptions
- Support state checking: ```state```, ```isPending()```, ```isRejected()```, ```isFulfilled()```
- Support resolving and rejecting: ```resolve(data?)```, ```reject(reason?)```
- Make it possible to ignore assertion errors inside the success/failure/finally callbacks.
- Create a resolved/rejected promise with one simple line.
- Wait for all promises to resolve using ```PromiseMock.all()``` method.
- Wait for one of the promises to resolve using ```PromiseMock.race()``` method.
- Written in Typescript so its type-safe
- Resolving or rejecting not pending promise will throw error
- Subscribing to resolved promise will raise proper callbacks
- Subscribing to rejected promise will raise proper callbacks
- **Synchronous!**

## Usage examples:

###### Typescript:
```typescript
import { PromiseMock, PromiseState } from 'promise-sync';

var promiseMock = new PromiseMock<number>();

var onSuccessCallback = () => console.log('success');
var onFailureCallback = () => console.log('failure');
var finallyCallback = () => console.log('finally');

promiseMock.then(onSuccessCallback, onFailureCallback)
           .success(onSuccessCallback)
           .catch(onFailureCallback)
           .finally(finallyCallback);

var dataToResolve = 123;
promiseMock.resolve(dataToResolve);
// Or:
var errorToReject = 'some error';
promiseMock.reject(errorToReject);

var isPending = promiseMock.isPending();
var isFulfilled = promiseMock.isFulfilled();
var isRejected = promiseMock.isRejected();

var state: PromiseState = promiseMock.state;

var rejectedPromise: PromiseMock<string> = PromiseMock.reject('some error');
var resolvedPromise: PromiseMock<string> = PromiseMock.resolve('some data');

var waitForAll: PromiseMock<any[]> =
  PromoseMock.all([rejectedPromise, resolvedPromise, 'random data that will be converted to resolved promise']);

var waitForFirst: PromiseMock<any> =
    PromoseMock.race([rejectedPromise, resolvedPromise, 'random data that will be converted to resolved promise']);
```

###### Same example using javascript
```javascript
var promise_sync = require('promise-sync');
var PromiseMock = promise_sync.PromiseMock;
var PromiseState = promise_sync.PromiseState;

var promiseMock = new PromiseMock();

var onSuccessCallback = function() { console.log('success'); }
var onFailureCallback = function() { console.log('failure'); }
var finallyCallback = function() { onsole.log('finally'); }

promiseMock.then(onSuccessCallback, onFailureCallback)
           .success(onSuccessCallback)
           .catch(onFailureCallback)
           .finally(finallyCallback);

var dataToResolve = 123;
promiseMock.resolve(dataToResolve);

var errorToReject = 'some error';
promiseMock.reject(errorToReject);

var isPending = promiseMock.isPending();
var isFulfilled = promiseMock.isFulfilled();
var isRejected = promiseMock.isRejected();

var state = promiseMock.state;

var rejectedPromise = PromiseMock.reject('some error');
var resolvedPromise = PromiseMock.resolve('some data');

var waitForAll =
  PromoseMock.all([rejectedPromise, resolvedPromise, 'random data that will be converted to resolved promise']);

var waitForFirst =
  PromoseMock.race([rejectedPromise, resolvedPromise, 'random data that will be converted to resolved promise']);
```

## Be aware!
The methods: 'then/success/catch/finally' catch exceptions thrown in the callbacks.
So if you want to do assertions inside of them you need to tell the ```PromiseMock``` to ignore assertion error exceptions,
otherwise the tests will pass even though the assertions are failing

If you are using chai for example:

###### Typescript:
```typescript
import { AssertionError } from 'chai';
import { PromiseMock } from 'promise-sync';

PromiseMock.setAssertionExceptionTypes([AssertionError]);
```

###### Same example using javascript
```javascript
var chai = require('chai');
var promise_sync = require('promise-sync');
var PromiseMock = promise_sync.PromiseMock;

PromiseMock.setAssertionExceptionTypes([chai.AssertionError]);
```
