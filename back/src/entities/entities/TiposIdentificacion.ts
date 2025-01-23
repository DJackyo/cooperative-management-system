import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asociados } from "./Asociados";

@Index("tipos_identificacion_pkey", ["id"], { unique: true })
@Index("tipos_identificacion_nombre_key", ["nombre"], { unique: true })
@Entity("tipos_identificacion", { schema: "public" })
export class TiposIdentificacion {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", unique: true, length: 255 })
  nombre: string;

  @OneToMany(() => Asociados, (asociados) => asociados.tipoIdentificacion)
  asociados: Asociados[];
}
