import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Asociados } from './Asociados';

@Index('retiros_asociados_pkey', ['id'], { unique: true })
@Entity('retiros_asociados', { schema: 'public' })
export class RetirosAsociados {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @ManyToOne(() => Asociados, { nullable: false })
  @JoinColumn([{ name: 'id_asociado', referencedColumnName: 'id' }])
  asociado: Asociados;

  @Column('timestamp without time zone', { name: 'fecha_solicitud', default: () => 'now()' })
  fechaSolicitud: Date;

  @Column('timestamp without time zone', { name: 'fecha_retiro', nullable: true })
  fechaRetiro: Date | null;

  @Column('text', { name: 'motivo', nullable: true })
  motivo: string | null;

  @Column('text', { name: 'adjunto', nullable: true })
  adjunto: string | null;

  @Column('numeric', { name: 'total_aportes', precision: 14, scale: 2, default: 0 })
  totalAportes: number;

  @Column('numeric', { name: 'saldo_creditos', precision: 14, scale: 2, default: 0 })
  saldoCreditos: number;

  @Column('numeric', { name: 'saldo_neto', precision: 14, scale: 2, default: 0 })
  saldoNeto: number;

  @Column('varchar', { name: 'estado', length: 30, default: 'PENDIENTE' })
  estado: string;

  @Column('varchar', { name: 'estado_solicitud', length: 20, default: 'PENDIENTE' })
  estadoSolicitud: string;

  @Column('text', { name: 'motivo_rechazo', nullable: true })
  motivoRechazo: string | null;

  @Column('text', { name: 'observaciones', nullable: true })
  observaciones: string | null;

  @Column('integer', { name: 'id_usuario_registro', nullable: true })
  idUsuarioRegistro: number | null;

  @Column('timestamp without time zone', { name: 'fecha_liquidacion', nullable: true })
  fechaLiquidacion: Date | null;
}