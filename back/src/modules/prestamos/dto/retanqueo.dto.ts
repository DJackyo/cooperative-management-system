import { Type } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsOptional,
  IsDate,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class RetanqueoDto {
  @IsInt()
  @IsPositive()
  idAsociado: number;

  @IsInt()
  @IsPositive()
  idPrestamoOrigen: number;

  @IsNumber()
  @IsPositive()
  montoNuevo: number;

  @IsInt()
  @IsPositive()
  plazoMeses: number;

  @IsOptional()
  idTasa?: any;

  @IsOptional()
  @IsBoolean()
  aplicaProteccionCartera?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaCredito?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaVencimiento?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaDesembolso?: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  estado?: string; // 'APROBADO' o 'SOLICITADO'
}

