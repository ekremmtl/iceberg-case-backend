import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
