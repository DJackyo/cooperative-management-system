import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Asociados } from "./Asociados";

@Index("asistencia_asamblea_pkey", ["idAsociado"], { unique: true })
@Entity("asoc_asistencia_asamblea", { schema: "public" })
export class AsocAsistenciaAsamblea {
  @Column("integer", { primary: true, name: "id_asociado" })
  idAsociado: number;

  @Column("timestamp without time zone", { name: "fecha", nullable: true })
  fecha: Date | null;

  @Column("character varying", { name: "asistio", nullable: true, length: 255 })
  asistio: string | null;

  @OneToOne(() => Asociados, (asociados) => asociados.asocAsistenciaAsamblea)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado2: Asociados;
}
