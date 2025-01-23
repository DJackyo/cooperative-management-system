import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsOptional()
  @IsString()
  username: string | null;

  @IsNotEmpty()
  @IsEmail()
  correoElectronico: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @IsOptional()
  fechaRegistro: Date | null;

  @IsOptional()
  fechaModificacion: Date | null;

  // Aquí se pueden agregar los campos relacionados a las relaciones OneToMany y ManyToMany si es necesario
}
