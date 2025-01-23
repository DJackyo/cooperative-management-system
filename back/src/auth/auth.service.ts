import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }
  // Datos mockeados
  private readonly users = [
    {
      id: 1,
      names: "Alice",
      role: "administrador",
      email: "admin@example.com",
      username: "admin@example.com",
      identification: "12345",
      password: "Coop_2025*",
      status: 'activo'
    },
    {
      id: 2,
      names: "Bob",
      role: "gestor",
      email: "gestor@example.com",
      username: "gestor@example.com",
      identification: "0987654321",
      password: "Coop_2025*",
      status: 'activo'
    },
    {
      id: 3,
      names: "Charlie",
      role: "socio",
      email: "socio@example.com",
      username: "socio@example.com",
      identification: "5678901234",
      password: "Coop_2025*",
      status: 'activo'
    },
  ];

  login(loginDto: LoginDto) {
    // Lógica para validar el usuario y generar un token        
    const user = this.users.find(
      (user) =>
        user.email === loginDto.email &&
        user.password === atob(loginDto.password),
    );    
    if (user) {
      const payload = { email: loginDto.email };
      const token = this.jwtService.sign(payload);
      return { access_token: token, role: user.role };
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
