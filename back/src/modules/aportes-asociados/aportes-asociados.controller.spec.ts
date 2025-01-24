import { Test, TestingModule } from '@nestjs/testing';
import { AportesAsociadosController } from './aportes-asociados.controller';
import { AportesAsociadosService } from './aportes-asociados.service';

describe('AportesAsociadosController', () => {
  let controller: AportesAsociadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AportesAsociadosController],
      providers: [AportesAsociadosService],
    }).compile();

    controller = module.get<AportesAsociadosController>(AportesAsociadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
