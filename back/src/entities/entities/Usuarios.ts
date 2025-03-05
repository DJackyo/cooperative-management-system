import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PresAprobacionPrestamos } from "./PresAprobacionPrestamos";
import { Roles } from "./Roles";
import { Asociados } from "./Asociados";

@Index("usuarios_correo_electronico_key", ["correoElectronico"], {
  unique: true,
})
@Index("usuarios_pkey", ["id"], { unique: true })
@Entity("usuarios", { schema: "public" })
export class Usuarios {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "username",
    nullable: true,
    length: 100,
  })
  username: string | null;

  @Column("character varying", {
    name: "correo_electronico",
    nullable: true,
    unique: true,
    length: 100,
  })
  correoElectronico: string | null;

  @Column("character varying", {
    name: "contrasena",
    nullable: true,
    length: 255,
  })
  contrasena: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_registro",
    nullable: true,
    default: () => "now()",
  })
  fechaRegistro: Date | null;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @OneToMany(
    () => PresAprobacionPrestamos,
    (presAprobacionPrestamos) => presAprobacionPrestamos.usuarioRevisor
  )
  presAprobacionPrestamos: PresAprobacionPrestamos[];

  @ManyToMany(() => Roles, (roles) => roles.usuarios)
  roles: Roles[];

  @ManyToOne(() => Asociados, (asociados) => asociados.usuarios)
  @JoinColumn([{ name: "id_asociado", referencedColumnName: "id" }])
  idAsociado: Asociados;
}
