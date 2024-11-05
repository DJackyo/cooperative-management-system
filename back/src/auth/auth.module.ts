import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // Cambia esto por una clave secreta segura
      signOptions: { expiresIn: '60s' }, // Tiempo de expiración del token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
