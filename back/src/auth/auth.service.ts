import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }
    // Datos mockeados
    private readonly users = [
        { userId: 1, username: 'admin', password: 'password' },
        { userId: 2, username: 'user1', password: 'password1' },
        { userId: 3, username: 'user2', password: 'password2' },
    ];

    login(loginDto: LoginDto) {
        // Lógica para validar el usuario y generar un token        
        const user = this.users.find(
            (user) =>
                user.username === loginDto.username &&
                user.password === loginDto.password,
        );

        if (user) {
            const payload = { email: loginDto.username }; // Crea el payload que quieras usar
            const token = this.jwtService.sign(payload);
            return { access_token: token };
        } else {
            throw new UnauthorizedException('Credenciales inválidas');
        }
    }
}
