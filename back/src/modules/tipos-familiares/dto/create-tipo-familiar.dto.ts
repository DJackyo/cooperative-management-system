import { IsString, MaxLength } from 'class-validator';

export class CreateTipoFamiliarDto {
  @IsString()
  @MaxLength(100)
  nombre: string;
}