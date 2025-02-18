import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Asociados } from "./Asociados";

@Index("contactos_pkey", ["idAsociado"], { unique: true })
@Entity("asoc_contactos", { schema: "public" })
export class AsocContactos {
  @Column("integer", { primary: true, name: "id_asociado" })
  idAsociado: number;

  @Column("numeric", { name: "telefono1", nullable: true })
  telefono1: string | null;

  @Column("numeric", { name: "telefono2", nullable: true })
  telefono2: string | null;

  @Column("character varying", {
    name: "correo_electronico",
    nullable: true,
    length: 255,
  })
  correoElectronico: string | null;

  @Column("character varying", { name: "nombre", nullable: true })
  nombre: string | null;

  @OneToOne(() => Asociados, (asociados) => asociados.asocContactos)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado2: Asociados;
}
