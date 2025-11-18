import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('recent-transactions')
  async getRecentTransactions() {
    try {
      const data = await this.dashboardService.getRecentTransactions();
      return {
        status: 'success',
        data,
        message: 'Transacciones recientes obtenidas exitosamente'
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        message: 'Error al obtener las transacciones recientes'
      };
    }
  }

  @Get('pending-supports')
  async getPendingPaymentSupports() {
    return await this.dashboardService.getPendingPaymentSupports();
  }

  @Get('savings-projection')
  async getSavingsProjection() {
    try {
      const data = await this.dashboardService.getSavingsProjection();
      return {
        status: 'success',
        data,
        message: 'Proyección de ahorros obtenida exitosamente'
      };
    } catch (error) {
      return {
        status: 'error',
        data: { projected: 0, registered: 0, percentage: 0 },
        message: 'Error al obtener la proyección de ahorros'
      };
    }
  }

  @Get('generate-projection/:year')
  async generateYearProjection(@Param('year') year: string) {
    try {
      const yearNumber = parseInt(year);
      if (isNaN(yearNumber) || yearNumber < 2020 || yearNumber > 2030) {
        return {
          status: 'error',
          message: 'Año inválido. Debe estar entre 2020 y 2030'
        };
      }
      
      const data = await this.dashboardService.generateYearProjection(yearNumber);
      return {
        status: 'success',
        data,
        message: data.message
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al generar las proyecciones del año'
      };
    }
  }
}