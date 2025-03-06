import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuarios } from 'src/entities/entities/Usuarios';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuarios)
    private usuariosRepository: Repository<Usuarios>,
  ) {}
  // Datos mockeados
  private readonly users = [
    {
      id: 1,
      names: 'Alice',
      role: 'administrador',
      email: 'admin@example.com',
      username: 'admin@example.com',
      identification: '12345',
      password: 'Coop_2025*',
      status: 'activo',
    },
    {
      id: 2,
      names: 'Bob',
      role: 'gestor',
      email: 'gestor@example.com',
      username: 'gestor@example.com',
      identification: '0987654321',
      password: 'Coop_2025*',
      status: 'activo',
    },
    {
      id: 3,
      names: 'Charlie',
      role: 'socio',
      email: 'socio@example.com',
      username: 'socio@example.com',
      identification: '5678901234',
      password: 'Coop_2025*',
      status: 'activo',
    },
  ];

  async login(loginDto: LoginDto) {
    // const user = this.users.find(
    //   (user) =>
    //     user.email === loginDto.email &&
    //     user.password === atob(loginDto.password),
    // );
    const user = await this.usuariosRepository.findOne({
      where: { username: loginDto.email, contrasena: loginDto.password },
      relations: ['roles', 'idAsociado', 'idAsociado.idEstado'],
    });
    if (user) {
      const payload = {
        email: loginDto.email,
        role: user.roles,
        userId: user.id,
        username: user.username,
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '4h',
      });

      return {
        access_token: token,
        role: user.roles.map((role) => role.nombre).join(','),
      };
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}
