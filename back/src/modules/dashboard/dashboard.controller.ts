import { Controller, Get, UseGuards } from '@nestjs/common';
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
    return await this.dashboardService.getRecentTransactions();
  }

  @Get('pending-supports')
  async getPendingPaymentSupports() {
    return await this.dashboardService.getPendingPaymentSupports();
  }
}