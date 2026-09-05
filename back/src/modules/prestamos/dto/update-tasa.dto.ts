import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTasaDto {
  @IsOptional()
  @IsNumber()
  anio?: number;

  @IsOptional()
  @IsString()
  tasa?: string;
}