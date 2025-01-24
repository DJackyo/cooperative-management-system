// CreateAportesAsociadosDto.ts

import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateAportesAsociadosDto {
  @IsNotEmpty()
  @IsDate()
  fechaAporte: Date;

  @IsNotEmpty()
  @IsString()
  monto: string;

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
