import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TiposIdentificacionController } from './tipos-identificacion.controller';
import { TiposIdentificacionService } from './tipos-identificacion.service';
import { TiposIdentificacion } from '../../entities/entities/TiposIdentificacion';

describe('TiposIdentificacionController', () => {
  let controller: TiposIdentificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposIdentificacionController],
      providers: [
        TiposIdentificacionService,
        {
          provide: getRepositoryToken(TiposIdentificacion),
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

    controller = module.get<TiposIdentificacionController>(
      TiposIdentificacionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});