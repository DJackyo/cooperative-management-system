import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Usuarios } from "./Usuarios";

@Index("roles_pkey", ["id"], { unique: true })
@Index("roles_nombre_key", ["nombre"], { unique: true })
@Entity("roles", { schema: "public" })
export class Roles {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "nombre", unique: true, length: 50 })
  nombre: string;

  @Column("character varying", {
    name: "descripcion",
    nullable: true,
    length: 255,
  })
  descripcion: string | null;

  @ManyToMany(() => Usuarios, (usuarios) => usuarios.roles)
  @JoinTable({
    name: "usuario_roles",
    joinColumns: [{ name: "rol_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "usuario_id", referencedColumnName: "id" }],
    schema: "public",
  })
  usuarios: Usuarios[];
}
