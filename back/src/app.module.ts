import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AsocAportesAsociados } from './entities/entities/AsocAportesAsociados';
import { PresAprobacionPrestamos } from './entities/entities/PresAprobacionPrestamos';
import { AsocAsistenciaAsamblea } from './entities/entities/AsocAsistenciaAsamblea';
import { AsocContactos } from './entities/entities/AsocContactos';
import { AsocEconomicaSocial } from './entities/entities/AsocEconomicaSocial';
import { Asociados } from './entities/entities/Asociados';
import { AsocInformacionFamiliar } from './entities/entities/AsocInformacionFamiliar';
import { AsocInformacionLaboral } from './entities/entities/AsocInformacionLaboral';
import { AsocTiposFamiliares } from './entities/entities/AsocTiposFamiliares';
import { AsocUbicaciones } from './entities/entities/AsocUbicaciones';
import { EstadosAprobacion } from './entities/entities/EstadosAprobacion';
import { EstadosAsociado } from './entities/entities/EstadosAsociado';
import { PresCancelaciones } from './entities/entities/PresCancelaciones';
import { PresCuotas } from './entities/entities/PresCuotas';
import { PresHistorialPrestamos } from './entities/entities/PresHistorialPrestamos';
import { PresMetodosPago } from './entities/entities/PresMetodosPago';
import { PresPagos } from './entities/entities/PresPagos';
import { Prestamos } from './entities/entities/Prestamos';
import { PresTasasPrestamo } from './entities/entities/PresTasasPrestamo';
import { Roles } from './entities/entities/Roles';
import { TiposIdentificacion } from './entities/entities/TiposIdentificacion';
import { Usuarios } from './entities/entities/Usuarios';
import { AsociadosModule } from './modules/asociados/asociados.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AsocAportesAsociadosModule } from './modules/aportes-asociados/aportes-asociados.module';
import { PrestamosModule } from './modules/prestamos/prestamos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PagosModule } from './modules/pagos/pagos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          AsocAportesAsociados,
          PresAprobacionPrestamos,
          AsocAsistenciaAsamblea,
          AsocContactos,
          AsocEconomicaSocial,
          Asociados,
          AsocInformacionFamiliar,
          AsocInformacionLaboral,
          AsocTiposFamiliares,
          AsocUbicaciones,
          EstadosAprobacion,
          EstadosAsociado,
          PresCancelaciones,
          PresCuotas,
          PresHistorialPrestamos,
          PresMetodosPago,
          PresPagos,
          Prestamos,
          PresTasasPrestamo,
          Roles,
          TiposIdentificacion,
          Usuarios,
        ],
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        logging: configService.get<string>('DB_LOGGING') === 'true', // Habilita el logging de SQL
        ssl:
          configService.get<string>('IS_PROD') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AsociadosModule,
    UsuariosModule,
    AsocAportesAsociadosModule,
    PrestamosModule,
    PagosModule,
    DashboardModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
