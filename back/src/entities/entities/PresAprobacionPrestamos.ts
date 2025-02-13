import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EstadosAprobacion } from "./EstadosAprobacion";
import { Prestamos } from "./Prestamos";
import { Usuarios } from "./Usuarios";

@Index("aprobacion_prestamos_pkey", ["id"], { unique: true })
@Entity("pres_aprobacion_prestamos", { schema: "public" })
export class PresAprobacionPrestamos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp without time zone", {
    name: "fecha_revision",
    nullable: true,
    default: () => "now()",
  })
  fechaRevision: Date | null;

  @Column("text", { name: "comentarios", nullable: true })
  comentarios: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @ManyToOne(
    () => EstadosAprobacion,
    (estadosAprobacion) => estadosAprobacion.PresAprobacionPrestamos
  )
  @JoinColumn([{ name: "id_estado_aprobacion", referencedColumnName: "id" }])
  idEstadoAprobacion: EstadosAprobacion;

  @ManyToOne(() => Prestamos, (prestamos) => prestamos.PresAprobacionPrestamos)
  @JoinColumn([{ name: "id_prestamo", referencedColumnName: "id" }])
  idPrestamo: Prestamos;

  @ManyToOne(() => Usuarios, (usuarios) => usuarios.PresAprobacionPrestamos)
  @JoinColumn([{ name: "usuario_revisor", referencedColumnName: "id" }])
  usuarioRevisor: Usuarios;
}
