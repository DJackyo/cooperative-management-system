import { Column, Entity, Index, OneToMany } from "typeorm";
import { Asociados } from "./Asociados";

@Index("estados_asociado_pk", ["id"], { unique: true })
@Entity("estados_asociado", { schema: "public" })
export class EstadosAsociado {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "estado", nullable: true })
  estado: string | null;

  @OneToMany(() => Asociados, (asociados) => asociados.idEstado)
  asociados: Asociados[];
}
