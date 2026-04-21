import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AgentsService } from '../agents/agents.service';
import { StageTransitionService } from '../domain/stage-transition.service';
import { CommissionService } from '../domain/commission.service';
import { TransactionStage } from '../common/enums/transaction-stage.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private agentsService: AgentsService,
    private stageTransitionService: StageTransitionService,
    private commissionService: CommissionService,
  ) { }

  async create(dto: CreateTransactionDto): Promise<TransactionDocument> {
    await this.agentsService.findById(dto.listingAgentId);
    await this.agentsService.findById(dto.sellingAgentId);

    const transaction = new this.transactionModel({
      ...dto,
      listingAgentId: new Types.ObjectId(dto.listingAgentId),
      sellingAgentId: new Types.ObjectId(dto.sellingAgentId),
    });
    return transaction.save();
  }

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find()
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async updateStage(id: string, dto: UpdateStageDto): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    this.stageTransitionService.validate(transaction.stage, dto.stage);

    const updateData: any = { stage: dto.stage };

    if (dto.stage === TransactionStage.COMPLETED) {
      updateData.financialBreakdown = this.commissionService.calculate({
        totalServiceFee: transaction.totalServiceFee,
        currency: transaction.currency,
        listingAgentId: transaction.listingAgentId.toString(),
        sellingAgentId: transaction.sellingAgentId.toString(),
      });
    }

    const updated = await this.transactionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();

    return updated;
  }

  async addPayment(id: string, dto: AddPaymentDto): Promise<TransactionDocument> {
    const exists = await this.transactionModel.findById(id);
    if (!exists) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const payment = {
      type: dto.type,
      amount: dto.amount,
      status: dto.status || 'pending',
      date: dto.date ? new Date(dto.date) : new Date(),
      note: dto.note,
    };

    const updated = await this.transactionModel
      .findByIdAndUpdate(id, { $push: { payments: payment } }, { new: true })
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();

    return updated;
  }

  async updatePayment(id: string, paymentId: string, dto: UpdatePaymentDto): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const payment = transaction.payments.find((p: any) => p._id.toString() === paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${paymentId} not found`);
    }

    const updateFields: Record<string, any> = {};
    if (dto.type !== undefined) updateFields['payments.$.type'] = dto.type;
    if (dto.amount !== undefined) updateFields['payments.$.amount'] = dto.amount;
    if (dto.status !== undefined) updateFields['payments.$.status'] = dto.status;
    if (dto.date !== undefined) updateFields['payments.$.date'] = new Date(dto.date);
    if (dto.note !== undefined) updateFields['payments.$.note'] = dto.note;

    const updated = await this.transactionModel
      .findOneAndUpdate(
        { _id: id, 'payments._id': paymentId },
        { $set: updateFields },
        { new: true },
      )
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();

    return updated;
  }

  async removePayment(id: string, paymentId: string): Promise<TransactionDocument> {
    const exists = await this.transactionModel.findById(id);
    if (!exists) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const updated = await this.transactionModel
      .findByIdAndUpdate(
        id,
        { $pull: { payments: { _id: new Types.ObjectId(paymentId) } } },
        { new: true },
      )
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();

    return updated;
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<TransactionDocument> {
    const update: any = { ...dto };
    if (dto.listingAgentId) {
      await this.agentsService.findById(dto.listingAgentId);
      update.listingAgentId = new Types.ObjectId(dto.listingAgentId);
    }
    if (dto.sellingAgentId) {
      await this.agentsService.findById(dto.sellingAgentId);
      update.sellingAgentId = new Types.ObjectId(dto.sellingAgentId);
    }
    const transaction = await this.transactionModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('listingAgentId', 'fullName email')
      .populate('sellingAgentId', 'fullName email')
      .exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
  }

  async getFinancialBreakdown(id: string) {
    const transaction = await this.transactionModel.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    if (transaction.stage !== TransactionStage.COMPLETED) {
      throw new BadRequestException(
        'Financial breakdown is only available for completed transactions.',
      );
    }
    return transaction.financialBreakdown;
  }
}
