import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    // Puedes agregar más campos según sea necesario, como nombre, rol, etc.
}