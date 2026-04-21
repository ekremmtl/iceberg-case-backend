import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AgentsModule } from '../agents/agents.module';
import { StageTransitionService } from '../domain/stage-transition.service';
import { CommissionService } from '../domain/commission.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    AgentsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, StageTransitionService, CommissionService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
