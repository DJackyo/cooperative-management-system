import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadosAprobacionController } from './estados-aprobacion.controller';
import { EstadosAprobacionService } from './estados-aprobacion.service';
import { EstadosAprobacion } from '../../entities/entities/EstadosAprobacion';

describe('EstadosAprobacionController', () => {
  let controller: EstadosAprobacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadosAprobacionController],
      providers: [
        EstadosAprobacionService,
        {
          provide: getRepositoryToken(EstadosAprobacion),
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

    controller = module.get<EstadosAprobacionController>(EstadosAprobacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});