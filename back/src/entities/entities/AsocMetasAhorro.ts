import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Asociados } from './Asociados';

@Entity('asoc_metas_ahorro')
export class AsocMetasAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'asociado_id' })
  asociadoId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'meta_mensual' })
  metaMensual: number;

  @Column({ type: 'int', name: 'año' })
  año: number;

  @Column({ type: 'boolean', default: true, name: 'activa' })
  activa: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @ManyToOne(() => Asociados)
  @JoinColumn({ name: 'asociado_id' })
  asociado: Asociados;
}