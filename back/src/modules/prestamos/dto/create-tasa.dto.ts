import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTasaDto {
  @IsNumber()
  anio: number;

  @IsString()
  tasa: string;
}