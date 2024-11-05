import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCreditDto } from './dto/CreateCreditDto';
import { UpdateCreditDto } from './dto/UpdateCreditDto';

@Injectable()
export class CreditsService {
    private readonly credits = [
        { id: 1, amount: 5000, interestRate: 5, term: 12, startDate: '2024-01-01' },
        { id: 2, amount: 10000, interestRate: 7, term: 24, startDate: '2024-02-01' },
    ];
    private currentId = 3; // Simulación de un ID auto-incremental

    create(createCreditDto: CreateCreditDto) {
        const newCredit = {
            id: this.currentId++,
            ...createCreditDto,
        };
        this.credits.push(newCredit);
        return newCredit;
    }

    findAll() {
        return this.credits;
    }

    findOne(id: number) {
        const credit = this.credits.find(credit => credit.id === id);
        if (!credit) {
            throw new NotFoundException(`Crédito con ID ${id} no encontrado`);
        }
        return credit;
    }

    update(id: number, updateCreditDto: UpdateCreditDto) {
        const creditIndex = this.credits.findIndex(credit => credit.id === id);
        if (creditIndex === -1) {
            throw new NotFoundException(`Crédito con ID ${id} no encontrado`);
        }

        const updatedCredit = { ...this.credits[creditIndex], ...updateCreditDto };
        this.credits[creditIndex] = updatedCredit;
        return updatedCredit;
    }

    remove(id: number) {
        const creditIndex = this.credits.findIndex(credit => credit.id === id);
        if (creditIndex === -1) {
            throw new NotFoundException(`Crédito con ID ${id} no encontrado`);
        }

        this.credits.splice(creditIndex, 1);
        return { message: 'Crédito eliminado correctamente' };
    }
}
