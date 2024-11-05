import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateSavingsDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    type: string; // Ejemplo: "Mensual", "Anual"

    @IsDateString()
    @IsNotEmpty()
    createdAt: string; // Fecha de creación
}
