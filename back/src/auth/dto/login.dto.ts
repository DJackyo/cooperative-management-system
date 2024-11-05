import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
