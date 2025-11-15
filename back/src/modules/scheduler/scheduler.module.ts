import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoanStatusService } from './loan-status.service';
import { Prestamos } from '../../entities/entities/Prestamos';
import { PresCuotas } from '../../entities/entities/PresCuotas';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Prestamos, PresCuotas]),
  ],
  providers: [LoanStatusService],
})
export class SchedulerModule {}