import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Asociados } from "./Asociados";
import { AsocTiposFamiliares } from "./AsocTiposFamiliares";

@Index("asoc_informacion_familiar_pk", ["id"], { unique: true })
@Entity("asoc_informacion_familiar", { schema: "public" })
export class AsocInformacionFamiliar {
  @Column("character varying", { name: "nombres", nullable: true, length: 255 })
  nombres: string | null;

  @Column("integer", { name: "tipo_identificacion_id", nullable: true })
  tipoIdentificacionId: number | null;

  @Column("numeric", { name: "numero_de_identificacion" })
  numeroDeIdentificacion: string;

  @Column("integer", { primary: true, name: "id" })
  id: number;

  @ManyToOne(() => Asociados, (asociados) => asociados.asocInformacionFamiliars)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado: Asociados;

  @ManyToOne(
    () => AsocTiposFamiliares,
    (asocTiposFamiliares) => asocTiposFamiliares.asocInformacionFamiliars
  )
  @JoinColumn([{ name: "tipo_familiar_id", referencedColumnName: "id" }])
  tipoFamiliar: AsocTiposFamiliares;
}
