import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuarios } from 'src/entities/entities/Usuarios';
import { UsuariosModule } from 'src/modules/usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule, // Asegúrate de importar ConfigModule
    TypeOrmModule.forFeature([Usuarios]),
    UsuariosModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigModule se debe inyectar
      inject: [ConfigService], // Inyectamos ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Aquí es donde tomamos el secreto de la configuración
        signOptions: { expiresIn: '4h' }, // Opcional: tiempo de expiración del JWT
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
