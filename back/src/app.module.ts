import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CreditsModule } from './credits/credits.module';
import { SavingsModule } from './savings/savings.module';
import { AuthModule } from './auth/auth.module';
import { AportesAsociados } from './entities/entities/AportesAsociados';
import { AprobacionPrestamos } from './entities/entities/AprobacionPrestamos';
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
import { AportesAsociadosModule } from './modules/aportes-asociados/aportes-asociados.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: '_coop',
      entities: [
        AportesAsociados,
        AprobacionPrestamos,
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
      ], // Aquí agregas todas tus entidades
      synchronize: false, // Este parámetro sincroniza las entidades con la base de datos. Solo para desarrollo.
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    }),
    UsersModule,
    CreditsModule,
    SavingsModule,
    AuthModule,
    AsociadosModule,
    UsuariosModule,
    AportesAsociadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
