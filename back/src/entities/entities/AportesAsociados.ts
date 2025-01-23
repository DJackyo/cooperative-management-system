import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Asociados } from "./Asociados";

@Index("aportes_asociados_pkey", ["id"], { unique: true })
@Entity("aportes_asociados", { schema: "public" })
export class AportesAsociados {
  @Column("timestamp without time zone", { name: "fecha" })
  fecha: Date;

  @Column("numeric", { name: "valor", default: () => "0" })
  valor: string;

  @Column("character varying", {
    name: "observaciones",
    nullable: true,
    length: 255,
  })
  observaciones: string | null;

  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @ManyToOne(() => Asociados, (asociados) => asociados.aportesAsociados)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado: Asociados;
}
