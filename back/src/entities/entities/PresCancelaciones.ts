import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Prestamos } from "./Prestamos";

@Index("cancelaciones_pkey", ["id"], { unique: true })
@Entity("pres_cancelaciones", { schema: "public" })
export class PresCancelaciones {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp without time zone", {
    name: "fecha_cancelacion",
    nullable: true,
    default: () => "now()",
  })
  fechaCancelacion: Date | null;

  @Column("numeric", {
    name: "monto_cancelado",
    nullable: true,
    default: () => "0",
  })
  montoCancelado: string | null;

  @ManyToOne(() => Prestamos, (prestamos) => prestamos.presCancelaciones)
  @JoinColumn([{ name: "id_prestamo", referencedColumnName: "id" }])
  idPrestamo: Prestamos;
}
