import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Prestamos } from "./Prestamos";
import { PresPagos } from "./PresPagos";

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
  monto: number;

  @Column("character varying", { name: "estado", nullable: true, length: 50 })
  estado: string | null;

  @ManyToOne(() => Prestamos, (prestamos) => prestamos.presCuotas)
  @JoinColumn([{ name: "id_prestamo", referencedColumnName: "id" }])
  idPrestamo: Prestamos;

  @OneToMany(() => PresPagos, (presPagos) => presPagos.idCuota)
  presPagos: PresPagos[];
}
