import { IsString, IsNumber, IsMongoId, IsOptional, Min } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  propertyTitle?: string;

  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalServiceFee?: number;

  @IsOptional()
  @IsMongoId()
  listingAgentId?: string;

  @IsOptional()
  @IsMongoId()
  sellingAgentId?: string;
}
