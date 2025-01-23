import { IsString, IsOptional, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAsociadoDto {
  @IsOptional()
  @IsNumber()
  tipoIdentificacionId: number | null;

  @IsOptional()
  @IsString()
  numeroDeIdentificacion: string;

  @IsOptional()
  @IsString()
  fechaDeExpedicion: string | null;

  @IsOptional()
  @IsString()
  apellido1: string;

  @IsOptional()
  @IsString()
  apellido2: string | null;

  @IsOptional()
  @IsString()
  nombre1: string;

  @IsOptional()
  @IsString()
  nombre2: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaDeNacimiento: Date | null;

  @IsOptional()
  @IsString()
  genero: string | null;

  @IsOptional()
  @IsString()
  estadoCivil: string | null;

  @IsOptional()
  @IsBoolean()
  esAsociado: boolean | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaModificacion: Date | null;
}
