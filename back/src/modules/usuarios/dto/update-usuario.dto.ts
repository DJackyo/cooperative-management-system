import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  username: string | null;

  @IsOptional()
  @IsEmail()
  correoElectronico: string;

  @IsOptional()
  @IsString()
  contrasena: string;

  @IsOptional()
  fechaModificacion: Date | null;
}
