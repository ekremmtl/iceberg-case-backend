import { IsEnum, IsNumber, IsOptional, IsDateString, IsString, Min } from 'class-validator';
import { PaymentType, PaymentStatus } from '../../common/enums/payment.enum';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

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
