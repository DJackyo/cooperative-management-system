import { Test, TestingModule } from '@nestjs/testing';
import { AsociadosService } from './asociados.service';

describe('AsociadosService', () => {
  let service: AsociadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsociadosService],
    }).compile();

    service = module.get<AsociadosService>(AsociadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
