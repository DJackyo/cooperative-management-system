import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class UpdateEstadoAsociadoDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  estado?: string | null;
}