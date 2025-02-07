import { Type } from "class-transformer";
import { IsInt, IsPositive, IsOptional, IsDate, IsNumberString, IsString } from "class-validator";

export class PrestamoDto {
    @IsInt()
    @IsPositive()
    id: number;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaCredito?: Date | null;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaVencimiento?: Date | null;
  
    @IsNumberString()
    monto: string;
  
    @IsInt()
    @IsPositive()
    plazoMeses: number;
  
    @IsOptional()
    @IsNumberString()
    cuotaMensual?: string | null;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaSolicitud?: Date | null;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaDesembolso?: Date | null;
  
    @IsOptional()
    @IsString()
    estado?: string | null;
  
    @IsOptional()
    @IsString()
    observaciones?: string | null;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaActualizacion?: Date | null;
  }