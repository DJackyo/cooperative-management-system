import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetodosPagoController } from './metodos-pago.controller';
import { MetodosPagoService } from './metodos-pago.service';
import { PresMetodosPago } from '../../entities/entities/PresMetodosPago';

describe('MetodosPagoController', () => {
  let controller: MetodosPagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetodosPagoController],
      providers: [
        MetodosPagoService,
        {
          provide: getRepositoryToken(PresMetodosPago),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MetodosPagoController>(MetodosPagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});