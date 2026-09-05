import { IsString, MaxLength } from 'class-validator';

export class CreateMetodoPagoDto {
  @IsString()
  @MaxLength(255)
  nombre: string;
}