import { Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Asociados } from "./Asociados";

@Index("estados_asociado_pk", ["id"], { unique: true })
@Entity("estados_asociado", { schema: "public" })
export class EstadosAsociado {
  @PrimaryColumn("integer", { name: "id" })
  id: number;

  @Column("character varying", { name: "estado", nullable: true })
  estado: string | null;

  @OneToMany(() => Asociados, (asociados) => asociados.idEstado)
  asociados: Asociados[];
}
