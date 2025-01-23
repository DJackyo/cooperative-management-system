import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Asociados } from "./Asociados";

@Index("economica_social_pkey", ["idAsociado"], { unique: true })
@Entity("asoc_economica_social", { schema: "public" })
export class AsocEconomicaSocial {
  @Column("integer", { primary: true, name: "id_asociado" })
  idAsociado: number;

  @Column("numeric", { name: "estrato", nullable: true })
  estrato: string | null;

  @Column("numeric", { name: "nivel_ingresos", nullable: true })
  nivelIngresos: string | null;

  @Column("character varying", {
    name: "sector_economico",
    nullable: true,
    length: 255,
  })
  sectorEconomico: string | null;

  @Column("character varying", { name: "calidad", nullable: true, length: 255 })
  calidad: string | null;

  @Column("character varying", {
    name: "reingreso",
    nullable: true,
    length: 255,
  })
  reingreso: string | null;

  @OneToOne(() => Asociados, (asociados) => asociados.asocEconomicaSocial)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado2: Asociados;
}
