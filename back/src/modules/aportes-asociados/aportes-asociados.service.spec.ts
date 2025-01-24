import { Test, TestingModule } from '@nestjs/testing';
import { AportesAsociadosService } from './aportes-asociados.service';

describe('AportesAsociadosService', () => {
  let service: AportesAsociadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AportesAsociadosService],
    }).compile();

    service = module.get<AportesAsociadosService>(AportesAsociadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
