import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo estado de asociado.
 * Nota: la entidad EstadosAsociado utiliza una PK manual (no auto-incremental),
 * por lo que el `id` debe proporcionarse al crear.
 */
export class CreateEstadoAsociadoDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  estado?: string | null;
}