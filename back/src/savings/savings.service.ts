import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSavingsDto } from './dto/CreateSavingsDto';
import { UpdateSavingsDto } from './dto/UpdateSavingsDto';

@Injectable()
export class SavingsService {
    private readonly savings = [
        { id: 1, amount: 1000, type: 'Mensual', createdAt: '2024-01-01' },
        { id: 2, amount: 5000, type: 'Anual', createdAt: '2024-01-15' },
    ];
    private currentId = 3; // Simulación de un ID auto-incremental

    create(createSavingsDto: CreateSavingsDto) {
        const newSaving = {
            id: this.currentId++,
            ...createSavingsDto,
        };
        this.savings.push(newSaving);
        return newSaving;
    }

    findAll() {
        return this.savings;
    }

    findOne(id: number) {
        const saving = this.savings.find(saving => saving.id === id);
        if (!saving) {
            throw new NotFoundException(`Ahorro con ID ${id} no encontrado`);
        }
        return saving;
    }

    update(id: number, updateSavingsDto: UpdateSavingsDto) {
        const savingIndex = this.savings.findIndex(saving => saving.id === id);
        if (savingIndex === -1) {
            throw new NotFoundException(`Ahorro con ID ${id} no encontrado`);
        }

        const updatedSaving = { ...this.savings[savingIndex], ...updateSavingsDto };
        this.savings[savingIndex] = updatedSaving;
        return updatedSaving;
    }

    remove(id: number) {
        const savingIndex = this.savings.findIndex(saving => saving.id === id);
        if (savingIndex === -1) {
            throw new NotFoundException(`Ahorro con ID ${id} no encontrado`);
        }

        this.savings.splice(savingIndex, 1);
        return { message: 'Ahorro eliminado correctamente' };
    }
}
