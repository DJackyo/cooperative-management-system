import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Prestamos } from "./Prestamos";

@Index("tasas_prestamo_anio_key", ["anio"], { unique: true })
@Index("tasas_prestamo_pkey", ["id"], { unique: true })
@Entity("pres_tasas_prestamo", { schema: "public" })
export class PresTasasPrestamo {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "anio", unique: true })
  anio: number;

  @Column("numeric", {
    name: "tasa",
    precision: 5,
    scale: 4,
    default: () => "0.014",
  })
  tasa: string;

  @OneToMany(() => Prestamos, (prestamos) => prestamos.idTasa)
  prestamos: Prestamos[];
}
