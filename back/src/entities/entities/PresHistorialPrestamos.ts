import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Prestamos } from "./Prestamos";

@Index("historial_prestamos_pkey", ["id"], { unique: true })
@Entity("pres_historial_prestamos", { schema: "public" })
export class PresHistorialPrestamos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "campo_modificado",
    nullable: true,
    length: 255,
  })
  campoModificado: string | null;

  @Column("character varying", {
    name: "valor_anterior",
    nullable: true,
    length: 255,
  })
  valorAnterior: string | null;

  @Column("character varying", {
    name: "nuevo_valor",
    nullable: true,
    length: 255,
  })
  nuevoValor: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @ManyToOne(() => Prestamos, (prestamos) => prestamos.presHistorialPrestamos)
  @JoinColumn([{ name: "id_prestamo", referencedColumnName: "id" }])
  idPrestamo: Prestamos;
}
