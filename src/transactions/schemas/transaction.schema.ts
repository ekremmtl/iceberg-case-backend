import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class FinancialBreakdown {
  @Prop({ required: true }) totalServiceFee: number;
  @Prop({ required: true }) currency: string;
  @Prop({ required: true }) agencyAmount: number;
  @Prop({ required: true }) agentPoolAmount: number;
  @Prop({ required: true }) listingAgentAmount: number;
  @Prop({ required: true }) sellingAgentAmount: number;
  @Prop() listingAgentReason: string;
  @Prop() sellingAgentReason: string;
  @Prop() calculatedAt: Date;
}

const FinancialBreakdownSchema = SchemaFactory.createForClass(FinancialBreakdown);

@Schema({ timestamps: true })
export class PaymentRecord {
  @Prop({ required: true, enum: ['earnest_money', 'service_fee', 'other'] })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending', enum: ['pending', 'received'] })
  status: string;

  @Prop()
  date: Date;

  @Prop()
  note: string;
}

const PaymentRecordSchema = SchemaFactory.createForClass(PaymentRecord);

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  propertyTitle: string;

  @Prop({ required: true })
  propertyAddress: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  totalServiceFee: number;

  @Prop({ default: 'GBP' })
  currency: string;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  listingAgentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  sellingAgentId: Types.ObjectId;

  @Prop({
    default: 'agreement',
    enum: ['agreement', 'earnest_money', 'title_deed', 'completed'],
  })
  stage: string;

  @Prop({ type: [PaymentRecordSchema], default: [] })
  payments: PaymentRecord[];

  @Prop({ type: FinancialBreakdownSchema })
  financialBreakdown: FinancialBreakdown;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
