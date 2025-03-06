// CreateAsocAportesAsociadosDto.ts

import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateAsocAportesAsociadosDto {
  @IsNotEmpty()
  @IsDate()
  fechaAporte: Date;

  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNotEmpty()
  @IsString()
  tipoAporte: string;

  @IsOptional()
  @IsString()
  metodoPago?: string;

  @IsOptional()
  @IsString()
  comprobante?: string;

  @IsNotEmpty()
  @IsNumber()
  idAsociado: number; // Este es el id del asociado

  @IsOptional()
  @IsNumber()
  idUsuarioRegistro?: number; // id del usuario que registra el aporte
}
