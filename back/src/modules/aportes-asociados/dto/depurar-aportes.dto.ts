import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ConsultarDuplicadosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idAsociado?: number;
}

export class GrupoDepuracionDto {
  @IsInt()
  @Min(1)
  idAsociado: number;

  @Matches(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/)
  periodo: string;

  @Matches(/^[a-f0-9]{32}$/)
  version: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}

export class DepurarAportesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => GrupoDepuracionDto)
  grupos: GrupoDepuracionDto[];

  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(10)
  @MaxLength(500)
  motivo: string;
}
