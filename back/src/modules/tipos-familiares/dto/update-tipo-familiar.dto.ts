import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTipoFamiliarDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}