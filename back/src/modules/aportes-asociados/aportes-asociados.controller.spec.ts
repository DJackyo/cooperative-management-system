import { Test, TestingModule } from '@nestjs/testing';
import { AsocAportesAsociadosController } from './aportes-asociados.controller';
import { AsocAportesAsociadosService } from './aportes-asociados.service';

describe('AsocAportesAsociadosController', () => {
  let controller: AsocAportesAsociadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsocAportesAsociadosController],
      providers: [AsocAportesAsociadosService],
    }).compile();

    controller = module.get<AsocAportesAsociadosController>(AsocAportesAsociadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
