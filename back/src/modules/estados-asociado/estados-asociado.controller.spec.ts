import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadosAsociadoController } from './estados-asociado.controller';
import { EstadosAsociadoService } from './estados-asociado.service';
import { EstadosAsociado } from '../../entities/entities/EstadosAsociado';

describe('EstadosAsociadoController', () => {
  let controller: EstadosAsociadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadosAsociadoController],
      providers: [
        EstadosAsociadoService,
        {
          provide: getRepositoryToken(EstadosAsociado),
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

    controller = module.get<EstadosAsociadoController>(EstadosAsociadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});