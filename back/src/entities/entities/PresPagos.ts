import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PresCuotas } from "./PresCuotas";
import { PresMetodosPago } from "./PresMetodosPago";

@Index("pagos_pkey", ["idPago"], { unique: true })
@Entity("pres_pagos", { schema: "public" })
export class PresPagos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_pago" })
  idPago: number;

  @Column("integer", { name: "id_prestamo" })
  idPrestamo: number;

  @Column("timestamp without time zone", {
    name: "fecha_vencimiento",
    nullable: true,
  })
  fechaVencimiento: Date | null;

  @Column("integer", {
    name: "dias_en_mora",
    nullable: true,
    default: () => "0",
  })
  diasEnMora: number | null;

  @Column("timestamp without time zone", {
    name: "dia_de_pago",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  diaDePago: Date | null;

  @Column("integer", { name: "num_cuota", nullable: true, default: () => "0" })
  numCuota: number | null;

  @Column("real", {
    name: "abono_extra",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  abonoExtra: number | null;

  @Column("real", {
    name: "proteccion_cartera",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  proteccionCartera: number | null;

  @Column("real", {
    name: "abono_capital",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  abonoCapital: number | null;

  @Column("real", {
    name: "intereses",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  intereses: number | null;

  @Column("real", {
    name: "monto",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  monto: number | null;

  @Column("real", {
    name: "mora",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  mora: number | null;

  @Column("real", {
    name: "total_pagado",
    nullable: true,
    precision: 24,
    default: () => "0",
  })
  totalPagado: number | null;

  @ManyToOne(() => PresCuotas, (presCuotas) => presCuotas.presPagos)
  @JoinColumn([{ name: "id_cuota", referencedColumnName: "id" }])
  idCuota: PresCuotas;

  @ManyToOne(
    () => PresMetodosPago,
    (presMetodosPago) => presMetodosPago.presPagos
  )
  @JoinColumn([{ name: "metodo_pago_id", referencedColumnName: "id" }])
  metodoPago: PresMetodosPago;
}
