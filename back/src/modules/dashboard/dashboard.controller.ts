import { Controller, Get, Query, UseGuards, Param, HttpException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Estadísticas del dashboard.
   * `year` es opcional: sin él se devuelve el histórico completo (todas las secciones).
   */
  @Get('stats')
  async getDashboardStats(@Query('year') year?: string) {
    return await this.dashboardService.getDashboardStats(year);
  }

  /** Años con información disponible para el selector de período. */
  @Get('years')
  async getAvailableYears() {
    try {
      const data = await this.dashboardService.getAvailableYears();
      return {
        status: 'success',
        data,
        message: 'Años disponibles obtenidos exitosamente'
      };
    } catch (error) {
      const currentYear = new Date().getFullYear();
      return {
        status: 'error',
        data: [currentYear],
        message: 'Error al obtener los años disponibles'
      };
    }
  }

  @Get('recent-transactions')
  async getRecentTransactions(@Query('year') year?: string) {
    try {
      const data = await this.dashboardService.getRecentTransactions(year);
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
  async getSavingsProjection(@Query('year') year?: string) {
    try {
      const data = await this.dashboardService.getSavingsProjection(year);
      return {
        status: 'success',
        data,
        message: 'Proyección de ahorros obtenida exitosamente'
      };
    } catch (error) {
      return {
        status: 'error',
        data: { year: null, projected: 0, registered: 0, percentage: 0 },
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

  @Get('recalculate-projection/:year')
  async recalculateYearProjection(@Param('year') year: string) {
    try {
      const yearNumber = parseInt(year);
      if (isNaN(yearNumber) || yearNumber < 2020 || yearNumber > 2030) {
        return {
          status: 'error',
          message: 'Año inválido. Debe estar entre 2020 y 2030'
        };
      }

      const data = await this.dashboardService.recalculateYearProjection(yearNumber);
      return {
        status: 'success',
        data,
        message: data.message
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al recalcular las proyecciones del año'
      };
    }
  }

  /**
   * Genera/actualiza las metas de ahorro del año indicado.
   * `year` opcional: si se envía (p. ej. el año seleccionado en el dashboard)
   * se generan las metas de ese año; sin él se usan las del año en curso.
   * Un `year` inválido responde 400 en lugar de generar otro año.
   */
  @Get('generate-current-metas')
  async generateCurrentYearMetas(@Query('year') year?: string) {
    try {
      const data = await this.dashboardService.generateCurrentYearMetas(year);
      return {
        status: 'success',
        data,
        message: data.message,
      };
    } catch (error) {
      // Propagar errores de validación (400) para no ocultar el año solicitado
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        status: 'error',
        message: 'Error al generar/modificar las metas del año solicitado',
      };
    }
  }
}
