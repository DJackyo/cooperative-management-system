import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateEstadoAprobacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombreEstado?: string;
}