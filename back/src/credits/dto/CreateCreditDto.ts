import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCreditDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    interestRate: number;

    @IsNumber()
    @IsNotEmpty()
    term: number; // Ejemplo: 12 meses, 24 meses

    @IsDateString()
    @IsNotEmpty()
    startDate: string;
}