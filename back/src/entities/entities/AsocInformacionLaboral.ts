import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Asociados } from "./Asociados";

@Index("informacion_laboral_pkey", ["idAsociado"], { unique: true })
@Entity("asoc_informacion_laboral", { schema: "public" })
export class AsocInformacionLaboral {
  @Column("integer", { primary: true, name: "id_asociado" })
  idAsociado: number;

  @Column("boolean", { name: "empleado", nullable: true })
  empleado: boolean | null;

  @Column("character varying", {
    name: "tipo_contrato",
    nullable: true,
    length: 255,
  })
  tipoContrato: string | null;

  @Column("character varying", {
    name: "ocupacion",
    nullable: true,
    length: 255,
  })
  ocupacion: string | null;

  @Column("character varying", {
    name: "jornada_laboral",
    nullable: true,
    length: 255,
  })
  jornadaLaboral: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_de_retiro",
    nullable: true,
  })
  fechaDeRetiro: Date | null;

  @Column("character varying", {
    name: "antiguedad",
    nullable: true,
    length: 255,
  })
  antiguedad: string | null;

  @OneToOne(() => Asociados, (asociados) => asociados.asocInformacionLaboral)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado2: Asociados;
}
