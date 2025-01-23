import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Prestamos } from "./Prestamos";

@Index("cuotas_pkey", ["id"], { unique: true })
@Entity("pres_cuotas", { schema: "public" })
export class PresCuotas {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "numero_cuota" })
  numeroCuota: number;

  @Column("timestamp without time zone", {
    name: "fecha_vencimiento",
    nullable: true,
  })
  fechaVencimiento: Date | null;

  @Column("numeric", { name: "monto" })
  monto: string;

  @Column("character varying", { name: "estado", nullable: true, length: 50 })
  estado: string | null;

  @ManyToOne(() => Prestamos, (prestamos) => prestamos.presCuotas)
  @JoinColumn([{ name: "id_prestamo", referencedColumnName: "id" }])
  idPrestamo: Prestamos;
}
