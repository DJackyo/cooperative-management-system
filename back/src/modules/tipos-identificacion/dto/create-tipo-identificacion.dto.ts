import { IsString, MaxLength } from 'class-validator';

export class CreateTipoIdentificacionDto {
  @IsString()
  @MaxLength(255)
  nombre: string;
}