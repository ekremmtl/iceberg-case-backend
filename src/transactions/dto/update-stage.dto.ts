import { IsEnum } from 'class-validator';
import { TransactionStage } from '../../common/enums/transaction-stage.enum';

export class UpdateStageDto {
  @IsEnum(TransactionStage)
  stage: TransactionStage;
}
