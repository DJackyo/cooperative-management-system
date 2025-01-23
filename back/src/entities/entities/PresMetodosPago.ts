import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PresPagos } from "./PresPagos";

@Index("metodos_pago_pkey", ["id"], { unique: true })
@Index("metodos_pago_nombre_key", ["nombre"], { unique: true })
@Entity("pres_metodos_pago", { schema: "public" })
export class PresMetodosPago {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", unique: true, length: 255 })
  nombre: string;

  @OneToMany(() => PresPagos, (presPagos) => presPagos.metodoPago)
  presPagos: PresPagos[];
}
