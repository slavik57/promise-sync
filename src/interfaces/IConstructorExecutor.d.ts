export interface IConstructorExecutor<T> {
    (resolve: (data?: T) => void, reject: (error?: any) => void): void;
}
