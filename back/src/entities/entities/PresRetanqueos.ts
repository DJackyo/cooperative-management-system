import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Asociados } from './Asociados';
import { Prestamos } from './Prestamos';
import { Usuarios } from './Usuarios';

@Index('pres_retanqueos_pkey', ['id'], { unique: true })
@Index('uq_pres_retanqueos_numero_recibo', ['numeroRecibo'], {
  unique: true,
  where: '"numero_recibo" IS NOT NULL',
})
@Entity('pres_retanqueos', { schema: 'public' })
export class PresRetanqueos {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('timestamp without time zone', {
    name: 'fecha_retanqueo',
    nullable: true,
    default: () => 'now()',
  })
  fechaRetanqueo: Date | null;

  // Credito anterior que fue liquidado por el retanqueo
  @ManyToOne(() => Prestamos, (prestamo) => prestamo.retanqueosOrigen, {
    nullable: false,
  })
  @JoinColumn([{ name: 'id_prestamo_origen', referencedColumnName: 'id' }])
  idPrestamoOrigen: Prestamos;

  // Credito nuevo generado por el retanqueo
  @ManyToOne(() => Prestamos, (prestamo) => prestamo.retanqueosNuevo, {
    nullable: false,
  })
  @JoinColumn([{ name: 'id_prestamo_nuevo', referencedColumnName: 'id' }])
  idPrestamoNuevo: Prestamos;

  @ManyToOne(() => Asociados, (asociado) => asociado.presRetanqueos, {
    nullable: false,
  })
  @JoinColumn([{ name: 'id_asociado', referencedColumnName: 'id' }])
  idAsociado: Asociados;

  // Usuario que ejecuto el retanqueo
  @ManyToOne(() => Usuarios, { nullable: true })
  @JoinColumn([{ name: 'id_usuario', referencedColumnName: 'id' }])
  idUsuario: Usuarios | null;

  @Column('integer', {
    name: 'monto_origen',
    nullable: true,
    default: 0,
  })
  montoOrigen: number | null;

  @Column('integer', {
    name: 'monto_nuevo',
    nullable: true,
    default: 0,
  })
  montoNuevo: number | null;

  @Column('numeric', {
    name: 'saldo_liquidado',
    nullable: true,
    precision: 14,
    scale: 2,
    default: 0,
  })
  saldoLiquidado: number | null;

  @Column('numeric', {
    name: 'desembolso_neto',
    nullable: true,
    precision: 14,
    scale: 2,
    default: 0,
  })
  desembolsoNeto: number | null;

  @Column('integer', {
    name: 'plazo_meses',
    nullable: true,
    default: 0,
  })
  plazoMeses: number | null;

  @Column('character varying', {
    name: 'estado',
    nullable: true,
    length: 30,
    default: 'APROBADO',
  })
  estado: string | null;

  @Column('text', {
    name: 'detalle_liquidacion',
    nullable: true,
  })
  detalleLiquidacion: string | null;

  @Column('text', {
    name: 'observaciones',
    nullable: true,
  })
  observaciones: string | null;

  @Column('character varying', {
    name: 'numero_recibo',
    nullable: true,
    length: 64,
  })
  numeroRecibo: string | null;
}
