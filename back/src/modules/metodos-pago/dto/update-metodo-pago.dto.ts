import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateMetodoPagoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombre?: string;
}