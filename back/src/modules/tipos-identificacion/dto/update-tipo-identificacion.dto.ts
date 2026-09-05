import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTipoIdentificacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombre?: string;
}