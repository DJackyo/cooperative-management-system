import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PresAprobacionPrestamos } from "./PresAprobacionPrestamos";
import { PresCancelaciones } from "./PresCancelaciones";
import { PresCuotas } from "./PresCuotas";
import { PresHistorialPrestamos } from "./PresHistorialPrestamos";
import { Asociados } from "./Asociados";
import { PresTasasPrestamo } from "./PresTasasPrestamo";

@Index("prestamos_pkey", ["id"], { unique: true })
@Entity("prestamos", { schema: "public" })
export class Prestamos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp without time zone", {
    name: "fecha_credito",
    nullable: true,
  })
  fechaCredito: Date | null;

  @Column("timestamp without time zone", {
    name: "fecha_vencimiento",
    nullable: true,
  })
  fechaVencimiento: Date | null;

  @Column("numeric", { name: "monto" })
  monto: string;

  @Column("integer", { name: "plazo_meses" })
  plazoMeses: number;

  @Column("numeric", { name: "cuota_mensual", nullable: true })
  cuotaMensual: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_solicitud",
    nullable: true,
    default: () => "now()",
  })
  fechaSolicitud: Date | null;

  @Column("timestamp without time zone", {
    name: "fecha_desembolso",
    nullable: true,
    default: () => "now()",
  })
  fechaDesembolso: Date | null;

  @Column("character varying", { name: "estado", nullable: true, length: 255 })
  estado: string | null;

  @Column("text", { name: "observaciones", nullable: true })
  observaciones: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_actualizacion",
    nullable: true,
  })
  fechaActualizacion: Date | null;

  @OneToMany(
    () => PresAprobacionPrestamos,
    (presAprobacionPrestamos) => presAprobacionPrestamos.idPrestamo
  )
  presAprobacionPrestamos: PresAprobacionPrestamos[];

  @OneToMany(
    () => PresCancelaciones,
    (presCancelaciones) => presCancelaciones.idPrestamo
  )
  presCancelaciones: PresCancelaciones[];

  @OneToMany(() => PresCuotas, (presCuotas) => presCuotas.idPrestamo)
  presCuotas: PresCuotas[];

  @OneToMany(
    () => PresHistorialPrestamos,
    (presHistorialPrestamos) => presHistorialPrestamos.idPrestamo
  )
  presHistorialPrestamos: PresHistorialPrestamos[];

  @ManyToOne(() => Asociados, (asociados) => asociados.prestamos)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado: Asociados;

  @ManyToOne(
    () => PresTasasPrestamo,
    (presTasasPrestamo) => presTasasPrestamo.prestamos
  )
  @JoinColumn([{ name: "id_tasa", referencedColumnName: "id" }])
  idTasa: PresTasasPrestamo;
}
