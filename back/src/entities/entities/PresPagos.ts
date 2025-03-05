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

  @Column("boolean", {
    name: "cuota_pagada",
    nullable: true,
    default: () => "false",
  })
  cuotaPagada: boolean | null;

  @Column("integer", { name: "num_cuota", nullable: true, default: () => "0" })
  numCuota: number | null;

  @Column("numeric", {
    name: "saldo_capital_inicial",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  saldoCapitalInicial: string | null;

  @Column("numeric", {
    name: "saldo_capital_original",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  saldoCapitalOriginal: string | null;

  @Column("numeric", {
    name: "saldo_capital",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  saldoCapital: string | null;

  @Column("numeric", {
    name: "abono_extra",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  abonoExtra: string | null;

  @Column("numeric", {
    name: "proteccion_cartera",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  proteccionCartera: string | null;

  @Column("numeric", {
    name: "abono_capital",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  abonoCapital: string | null;

  @Column("numeric", {
    name: "intereses",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  intereses: string | null;

  @Column("numeric", {
    name: "total_cuota",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  totalCuota: string | null;

  @Column("numeric", {
    name: "mora",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  mora: string | null;

  @Column("numeric", {
    name: "interes_pendiente",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  interesPendiente: string | null;

  @Column("numeric", {
    name: "diferencia_capital",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  diferenciaCapital: string | null;

  @Column("numeric", {
    name: "total_pagado",
    nullable: true,
    precision: 100,
    scale: 4,
    default: () => "0",
  })
  totalPagado: string | null;

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
