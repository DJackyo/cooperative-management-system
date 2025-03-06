import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AsocAportesAsociados } from "./AsocAportesAsociados";
import { AsocAsistenciaAsamblea } from "./AsocAsistenciaAsamblea";
import { AsocContactos } from "./AsocContactos";
import { AsocEconomicaSocial } from "./AsocEconomicaSocial";
import { AsocInformacionFamiliar } from "./AsocInformacionFamiliar";
import { AsocInformacionLaboral } from "./AsocInformacionLaboral";
import { EstadosAsociado } from "./EstadosAsociado";
import { TiposIdentificacion } from "./TiposIdentificacion";
import { AsocUbicaciones } from "./AsocUbicaciones";
import { Prestamos } from "./Prestamos";
import { Usuarios } from "./Usuarios";

@Index("asociados_pkey", ["id"], { unique: true })
@Index(
  "asociados_tipo_identificacion_id_numero_de_identificacion_key",
  ["numeroDeIdentificacion", "tipoIdentificacionId"],
  { unique: true }
)
@Entity("asociados", { schema: "public" })
export class Asociados {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", {
    name: "tipo_identificacion_id",
    nullable: true,
    unique: true,
  })
  tipoIdentificacionId: number | null;

  @Column("numeric", { name: "numero_de_identificacion", unique: true })
  numeroDeIdentificacion: string;

  @Column("character varying", {
    name: "fecha_de_expedicion",
    nullable: true,
    length: 255,
  })
  fechaDeExpedicion: string | null;

  @Column("character varying", { name: "apellido1", length: 255 })
  apellido1: string;

  @Column("character varying", {
    name: "apellido2",
    nullable: true,
    length: 255,
  })
  apellido2: string | null;

  @Column("character varying", { name: "nombre1", length: 255 })
  nombre1: string;

  @Column("character varying", { name: "nombre2", nullable: true, length: 255 })
  nombre2: string | null;

  @Column("timestamp without time zone", {
    name: "fecha_de_nacimiento",
    nullable: true,
  })
  fechaDeNacimiento: Date | null;

  @Column("character varying", { name: "genero", nullable: true, length: 255 })
  genero: string | null;

  @Column("character varying", {
    name: "estado_civil",
    nullable: true,
    length: 255,
  })
  estadoCivil: string | null;

  @Column("boolean", {
    name: "es_asociado",
    nullable: true,
    default: () => "true",
  })
  esAsociado: boolean | null;

  @Column("timestamp without time zone", {
    name: "fecha_modificacion",
    nullable: true,
    default: () => "now()",
  })
  fechaModificacion: Date | null;

  @OneToMany(
    () => AsocAportesAsociados,
    (asocAportesAsociados) => asocAportesAsociados.idAsociado
  )
  asocAportesAsociados: AsocAportesAsociados[];

  @OneToOne(
    () => AsocAsistenciaAsamblea,
    (asocAsistenciaAsamblea) => asocAsistenciaAsamblea.idAsociado2
  )
  asocAsistenciaAsamblea: AsocAsistenciaAsamblea;

  @OneToOne(() => AsocContactos, (asocContactos) => asocContactos.idAsociado2)
  asocContactos: AsocContactos;

  @OneToOne(
    () => AsocEconomicaSocial,
    (asocEconomicaSocial) => asocEconomicaSocial.idAsociado2
  )
  asocEconomicaSocial: AsocEconomicaSocial;

  @OneToMany(
    () => AsocInformacionFamiliar,
    (asocInformacionFamiliar) => asocInformacionFamiliar.idAsociado
  )
  asocInformacionFamiliars: AsocInformacionFamiliar[];

  @OneToOne(
    () => AsocInformacionLaboral,
    (asocInformacionLaboral) => asocInformacionLaboral.idAsociado2
  )
  asocInformacionLaboral: AsocInformacionLaboral;

  @ManyToOne(
    () => EstadosAsociado,
    (estadosAsociado) => estadosAsociado.asociados
  )
  @JoinColumn([{ name: "id_estado", referencedColumnName: "id" }])
  idEstado: EstadosAsociado;

  @ManyToOne(
    () => TiposIdentificacion,
    (tiposIdentificacion) => tiposIdentificacion.asociados
  )
  @JoinColumn([{ name: "tipo_identificacion_id", referencedColumnName: "id" }])
  tipoIdentificacion: TiposIdentificacion;

  @ManyToOne(
    () => AsocUbicaciones,
    (asocUbicaciones) => asocUbicaciones.asociados
  )
  @JoinColumn([{ name: "ubicacion_id", referencedColumnName: "id" }])
  ubicacion: AsocUbicaciones;

  @OneToMany(() => Prestamos, (prestamos) => prestamos.idAsociado)
  prestamos: Prestamos[];

  @OneToMany(() => Usuarios, (usuarios) => usuarios.idAsociado)
  usuarios: Usuarios[];
}
