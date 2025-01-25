import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asociados } from "./Asociados";

@Index("aportes_asociados_pkey", ["id"], { unique: true })
@Entity("aportes_asociados", { schema: "public" })
export class AportesAsociados {
  @Column("timestamp without time zone", { name: "fecha_aporte" })
  fechaAporte: Date;

  @Column("numeric", { name: "monto", default: () => "0" })
  monto: number;

  @Column("character varying", {
    name: "observaciones",
    nullable: true,
    length: 255,
  })
  observaciones: string | null;

  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @Column("timestamp without time zone", {
    name: "fecha_creacion",
    nullable: true,
    default: () => "now()",
  })
  fechaCreacion: Date | null;

  @Column("character varying", {
    name: "tipo_aporte",
    nullable: true,
    default: () => "'MENSUAL'",
  })
  tipoAporte: string | null;

  @Column("boolean", { name: "estado", nullable: true, default: () => "true" })
  estado: boolean | null;

  @Column("character varying", {
    name: "metodo_pago",
    nullable: true,
    default: () => "'EFECTIVO'",
  })
  metodoPago: string | null;

  @Column("character varying", { name: "comprobante", nullable: true })
  comprobante: string | null;

  @Column("integer", { name: "id_usuario_registro", nullable: true })
  idUsuarioRegistro: number | null;

  @ManyToOne(() => Asociados, (asociados) => asociados.aportesAsociados)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado: Asociados;
}
