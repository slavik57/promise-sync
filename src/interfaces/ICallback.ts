import {ISuccessCallback} from './ISuccessCallback';
import {IFailureCallback} from './IFailureCallback';
import {PromiseMock} from '../PromiseMock';

export interface ICallback<T> {
  success?: ISuccessCallback<T>;
  failure?: IFailureCallback<T>;
  finally?: () => any;

  nextPromise: PromiseMock<T>;
}
