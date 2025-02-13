import { Type } from "class-transformer";
import { IsOptional, IsDate, IsNumberString, IsInt, IsPositive, IsString, IsEnum } from "class-validator";

export class UpdatePrestamoDto {
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaCredito?: Date | null;
  
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    fechaVencimiento?: Date | null;
  
    @IsOptional()
    @IsNumberString()
    monto?: string;
  
    @IsOptional()
    @IsInt()
    @IsPositive()
    plazoMeses?: number;
  
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