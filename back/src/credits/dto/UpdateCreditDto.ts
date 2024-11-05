import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateCreditDto {
    @IsNumber()
    amount?: number;

    @IsNumber()
    interestRate?: number;

    @IsNumber()
    term?: number;

    @IsDateString()
    startDate?: string;
}
