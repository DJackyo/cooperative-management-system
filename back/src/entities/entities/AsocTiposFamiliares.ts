import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AsocInformacionFamiliar } from "./AsocInformacionFamiliar";

@Index("tipos_familiares_pkey", ["id"], { unique: true })
@Index("tipos_familiares_nombre_key", ["nombre"], { unique: true })
@Entity("asoc_tipos_familiares", { schema: "public" })
export class AsocTiposFamiliares {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", unique: true, length: 100 })
  nombre: string;

  @OneToMany(
    () => AsocInformacionFamiliar,
    (asocInformacionFamiliar) => asocInformacionFamiliar.tipoFamiliar
  )
  asocInformacionFamiliars: AsocInformacionFamiliar[];
}
