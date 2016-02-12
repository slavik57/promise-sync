import {ISuccessCallback} from './ISuccessCallback';
import {IFailureCallback} from './IFailureCallback';
import {PromiseMock} from '../PromiseMock';

export interface ICallback<T> {
  success?: ISuccessCallback<T, any>;
  failure?: IFailureCallback<any>;
  finally?: () => any;

  nextPromise: PromiseMock<any>;
}
