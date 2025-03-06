import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service'; // Asegúrate de tener un servicio de autenticación
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from 'src/modules/usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UsuariosService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.userId);
    console.log('JwtStrategy payload', payload);
    console.log('JwtStrategy user', user);

    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: payload.userId,
      username: payload.username,
      role: payload.role,
      user,
    };
  }
}
