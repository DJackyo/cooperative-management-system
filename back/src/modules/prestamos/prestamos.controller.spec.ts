import { Test, TestingModule } from '@nestjs/testing';
import { PrestamosController } from './prestamos.controller';
import { PrestamosService } from './prestamos.service';

describe('PrestamosController', () => {
  let controller: PrestamosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestamosController],
      providers: [PrestamosService],
    }).compile();

    controller = module.get<PrestamosController>(PrestamosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
