import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TiposFamiliaresController } from './tipos-familiares.controller';
import { TiposFamiliaresService } from './tipos-familiares.service';
import { AsocTiposFamiliares } from '../../entities/entities/AsocTiposFamiliares';

describe('TiposFamiliaresController', () => {
  let controller: TiposFamiliaresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposFamiliaresController],
      providers: [
        TiposFamiliaresService,
        {
          provide: getRepositoryToken(AsocTiposFamiliares),
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

    controller = module.get<TiposFamiliaresController>(TiposFamiliaresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});