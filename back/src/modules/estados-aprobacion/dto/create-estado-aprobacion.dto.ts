import { IsString, MaxLength } from 'class-validator';

export class CreateEstadoAprobacionDto {
  @IsString()
  @MaxLength(50)
  nombreEstado: string;
}