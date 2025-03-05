import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PresAprobacionPrestamos } from "./PresAprobacionPrestamos";

@Index("estados_aprobacion_pkey", ["id"], { unique: true })
@Index("estados_aprobacion_nombre_estado_key", ["nombreEstado"], {
  unique: true,
})
@Entity("estados_aprobacion", { schema: "public" })
export class EstadosAprobacion {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "nombre_estado",
    unique: true,
    length: 50,
  })
  nombreEstado: string;

  @OneToMany(
    () => PresAprobacionPrestamos,
    (presAprobacionPrestamos) => presAprobacionPrestamos.idEstadoAprobacion
  )
  presAprobacionPrestamos: PresAprobacionPrestamos[];
}
