import { Test, TestingModule } from '@nestjs/testing';
import { AsociadosController } from './asociados.controller';
import { AsociadosService } from './asociados.service';

describe('AsociadosController', () => {
  let controller: AsociadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsociadosController],
      providers: [AsociadosService],
    }).compile();

    controller = module.get<AsociadosController>(AsociadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
