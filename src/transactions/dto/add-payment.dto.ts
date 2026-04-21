import { IsEnum, IsNumber, IsOptional, IsDateString, IsString, Min } from 'class-validator';
import { PaymentType, PaymentStatus } from '../../common/enums/payment.enum';

export class AddPaymentDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
