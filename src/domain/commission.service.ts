import { Injectable } from '@nestjs/common';

interface CommissionInput {
  totalServiceFee: number;
  currency: string;
  listingAgentId: string;
  sellingAgentId: string;
}

export interface FinancialBreakdownResult {
  totalServiceFee: number;
  currency: string;
  agencyAmount: number;
  agentPoolAmount: number;
  listingAgentAmount: number;
  sellingAgentAmount: number;
  listingAgentReason: string;
  sellingAgentReason: string;
  calculatedAt: Date;
}

@Injectable()
export class CommissionService {
  calculate(input: CommissionInput): FinancialBreakdownResult {
    const { totalServiceFee, currency, listingAgentId, sellingAgentId } = input;

    const agencyAmount = totalServiceFee * 0.5;
    const agentPoolAmount = totalServiceFee * 0.5;

    const isSameAgent = listingAgentId.toString() === sellingAgentId.toString();

    let listingAgentAmount: number;
    let sellingAgentAmount: number;
    let listingAgentReason: string;
    let sellingAgentReason: string;

    if (isSameAgent) {
      listingAgentAmount = agentPoolAmount;
      sellingAgentAmount = 0;
      listingAgentReason =
        'Same agent handled both listing and selling — receives full agent pool (50% of service fee)';
      sellingAgentReason = 'Same as listing agent — commission accounted above';
    } else {
      listingAgentAmount = agentPoolAmount * 0.5;
      sellingAgentAmount = agentPoolAmount * 0.5;
      listingAgentReason = '50% of agent pool as listing agent';
      sellingAgentReason = '50% of agent pool as selling agent';
    }

    return {
      totalServiceFee,
      currency,
      agencyAmount,
      agentPoolAmount,
      listingAgentAmount,
      sellingAgentAmount,
      listingAgentReason,
      sellingAgentReason,
      calculatedAt: new Date(),
    };
  }
}
