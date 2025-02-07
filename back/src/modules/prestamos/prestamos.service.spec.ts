import { Test, TestingModule } from '@nestjs/testing';
import { PrestamosService } from './prestamos.service';

describe('PrestamosService', () => {
  let service: PrestamosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrestamosService],
    }).compile();

    service = module.get<PrestamosService>(PrestamosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
