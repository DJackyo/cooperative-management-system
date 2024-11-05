import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    username?: string;

    @IsEmail()
    email?: string;

    @IsString()
    password?: string;

    // Agrega más campos que quieras actualizar
}