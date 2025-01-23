import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asociados } from "./Asociados";

@Index("ubicaciones_pkey", ["id"], { unique: true })
@Entity("asoc_ubicaciones", { schema: "public" })
export class AsocUbicaciones {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "direccion",
    nullable: true,
    length: 255,
  })
  direccion: string | null;

  @Column("character varying", {
    name: "telefono",
    nullable: true,
    length: 255,
  })
  telefono: string | null;

  @Column("character varying", { name: "barrio", nullable: true, length: 255 })
  barrio: string | null;

  @Column("character varying", { name: "ciudad", nullable: true, length: 255 })
  ciudad: string | null;

  @Column("character varying", { name: "pais", nullable: true, length: 255 })
  pais: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @OneToMany(() => Asociados, (asociados) => asociados.ubicacion)
  asociados: Asociados[];
}
