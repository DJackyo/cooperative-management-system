import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamos } from '../../entities/entities/Prestamos';
import { PresCuotas } from '../../entities/entities/PresCuotas';

@Injectable()
export class LoanStatusService {
  constructor(
    @InjectRepository(Prestamos)
    private prestamosRepository: Repository<Prestamos>,
    @InjectRepository(PresCuotas)
    private cuotasRepository: Repository<PresCuotas>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOverdueLoans() {
    try {
      // Encontrar préstamos activos con cuotas vencidas no pagadas
      const overdueLoans = await this.prestamosRepository
        .createQueryBuilder('prestamo')
        .innerJoin('prestamo.presCuotas', 'cuota')
        .where('prestamo.estado = :estado', { estado: 'Activo' })
        .andWhere('cuota.fechaVencimiento < :today', { today: new Date() })
        .andWhere('cuota.pagado = :pagado', { pagado: false })
        .getMany();

      // Actualizar estado a 'Vencido'
      for (const loan of overdueLoans) {
        await this.prestamosRepository.update(loan.id, { estado: 'Vencido' });
      }

      console.log(`Updated ${overdueLoans.length} loans to overdue status`);
    } catch (error) {
      console.error('Error updating overdue loans:', error);
    }
  }
}