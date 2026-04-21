import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionStage } from '../common/enums/transaction-stage.enum';

const VALID_TRANSITIONS: Record<string, string> = {
  [TransactionStage.AGREEMENT]: TransactionStage.EARNEST_MONEY,
  [TransactionStage.EARNEST_MONEY]: TransactionStage.TITLE_DEED,
  [TransactionStage.TITLE_DEED]: TransactionStage.COMPLETED,
};

@Injectable()
export class StageTransitionService {
  validate(current: string, next: string): void {
    if (current === TransactionStage.COMPLETED) {
      throw new BadRequestException(
        'Transaction is already completed. No further stage changes are allowed.',
      );
    }

    const allowed = VALID_TRANSITIONS[current];
    if (!allowed || allowed !== next) {
      throw new BadRequestException(
        `Invalid stage transition: '${current}' → '${next}'. Expected next stage: '${allowed}'.`,
      );
    }
  }
}
