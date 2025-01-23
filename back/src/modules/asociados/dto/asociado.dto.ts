import { IsString, IsNumber, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TiposIdentificacionDto } from './tipos-identificacion.dto'; // DTO para TiposIdentificacion
import { EstadosAsociadoDto } from './estados-asociado.dto'; // DTO para EstadosAsociado

export class AsociadoDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  tipoIdentificacionId: number | null;

  @IsString()
  numeroDeIdentificacion: string;

  @IsOptional()
  @IsString()
  fechaDeExpedicion: string | null;

  @IsString()
  apellido1: string;

  @IsOptional()
  @IsString()
  apellido2: string | null;

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

  // Relación con TipoIdentificacion
  tipoIdentificacion?: TiposIdentificacionDto;

  // Relación con Estado
  idEstado?: EstadosAsociadoDto;
}
