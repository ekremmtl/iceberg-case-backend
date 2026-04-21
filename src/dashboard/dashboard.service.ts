import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';
import { Agent, AgentDocument } from '../agents/schemas/agent.schema';
import { TransactionStage } from '../common/enums/transaction-stage.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Agent.name)
    private agentModel: Model<AgentDocument>,
  ) {}

  async getSummary() {
    const [transactions, totalAgents] = await Promise.all([
      this.transactionModel.find().lean(),
      this.agentModel.countDocuments(),
    ]);

    const transactionsByStage = {
      agreement: 0,
      earnest_money: 0,
      title_deed: 0,
      completed: 0,
    };

    let totalServiceFeeCollected = 0;
    let totalAgencyRevenue = 0;

    for (const t of transactions) {
      transactionsByStage[t.stage] = (transactionsByStage[t.stage] || 0) + 1;

      if (t.stage === TransactionStage.COMPLETED && t.financialBreakdown) {
        totalServiceFeeCollected += t.financialBreakdown.totalServiceFee;
        totalAgencyRevenue += t.financialBreakdown.agencyAmount;
      }
    }

    return {
      totalTransactions: transactions.length,
      totalAgents,
      transactionsByStage,
      financials: {
        totalServiceFeeCollected,
        totalAgencyRevenue,
        currency: 'GBP',
      },
    };
  }
}
