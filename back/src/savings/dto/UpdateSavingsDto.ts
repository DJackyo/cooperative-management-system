import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateSavingsDto {
    @IsNumber()
    amount?: number;

    @IsString()
    type?: string;

    @IsDateString()
    createdAt?: string;
}
