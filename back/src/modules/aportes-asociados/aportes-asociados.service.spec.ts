import { Test, TestingModule } from '@nestjs/testing';
import { AsocAportesAsociadosService } from './aportes-asociados.service';

describe('AsocAportesAsociadosService', () => {
  let service: AsocAportesAsociadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsocAportesAsociadosService],
    }).compile();

    service = module.get<AsocAportesAsociadosService>(AsocAportesAsociadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
