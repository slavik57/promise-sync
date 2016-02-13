# promise-sync
Synchronous promise for making testing experience much easier.

## Installation
```
$ npm install promise-sync
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
- Support callback subscription: success(), catch(), then(), finally()
- Chaining callback subscriptions
- Support state checking: state, isPending(), isRejected(), isFulfilled()
- Support resolving and rejecting: resolve(data?), reject(reason?)
- Written in Typescript so its type-safe
- Resolving or rejecting not pending promise will throw error
- Subscrining to resolved promise will raise proper callbacks
- Subscrining to rejected promise will raise proper callbacks
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

var errorToReject = 'some error';
promiseMock.reject(errorToReject);

var isPending = promiseMock.isPending();
var isFulfilled = promiseMock.isFulfilled();
var isRejected = promiseMock.isRejected();

var state: PromiseState = promiseMock.state;
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
```
