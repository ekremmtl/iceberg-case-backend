import { IsString, IsNumber, IsMongoId, IsOptional, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  propertyTitle: string;

  @IsString()
  propertyAddress: string;

  @IsString()
  clientName: string;

  @IsNumber()
  @Min(0)
  totalServiceFee: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsMongoId()
  listingAgentId: string;

  @IsMongoId()
  sellingAgentId: string;
}
