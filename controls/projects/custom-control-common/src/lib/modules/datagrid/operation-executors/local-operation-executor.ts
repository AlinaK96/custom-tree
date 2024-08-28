import { IOperationExecutor } from '../interfaces/operator-executor';
import { LocalExecutorInput } from '../model/operation-executor/local-executor-input';

export class LocalOperationExecutor
  implements IOperationExecutor<LocalExecutorInput, boolean>
{
  includes(input: LocalExecutorInput): boolean {
    return input.item.toLowerCase().includes(input.filterValue.toLowerCase());
  }

  search(input: LocalExecutorInput): boolean {
    return new RegExp(input.item.toLowerCase()).test(
      input.filterValue.toLowerCase()
    );
  }
}
