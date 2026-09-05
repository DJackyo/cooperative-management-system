import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RetirosAsociadosService } from './retiros-asociados.service';

@Controller('retiros-asociados')
export class RetirosAsociadosController {
  constructor(private readonly retirosService: RetirosAsociadosService) {}

  @Get()
  findAll(@Query('estado') estado?: string) {
    return this.retirosService.findAll(estado);
  }

  @Get('saldos-negativos')
  findNegativeBalances() {
    return this.retirosService.findNegativeBalances();
  }

  @Get('calcular/:idAsociado')
  calculate(@Param('idAsociado') idAsociado: number) {
    return this.retirosService.calculate(idAsociado);
  }

  @Post(':idAsociado/liquidar')
  liquidate(@Param('idAsociado') idAsociado: number, @Body() payload: any) {
    return this.retirosService.liquidate(idAsociado, payload);
  }
}