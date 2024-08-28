export interface IOperationExecutor<TInput, TOutput> {
  search(input: TInput): TOutput;
  includes(input: TInput): TOutput;
}
