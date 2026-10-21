import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AportesDepuracionGuard } from './aportes-depuracion.guard';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

describe('AportesDepuracionGuard', () => {
  const guard = new AportesDepuracionGuard();
  const context = (roles: string[], id = 13): ExecutionContext =>
    new ExecutionContextHost([
      {
        user: { id, user: { id, roles: roles.map((nombre) => ({ nombre })) } },
      },
    ]);

  it.each(['ADMINISTRADOR', 'GESTOR DE OPERACIONES'])('permits %s', (role) => {
    expect(guard.canActivate(context([role]))).toBe(true);
  });

  it.each([[], ['SOCIO']])('rejects insufficient roles %j', (...roles) => {
    expect(() => guard.canActivate(context(roles.flat()))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects unauthenticated requests and invalid actors', () => {
    expect(() => guard.canActivate(new ExecutionContextHost([{}]))).toThrow(
      ForbiddenException,
    );
    expect(() => guard.canActivate(context(['ADMINISTRADOR'], 0))).toThrow(
      ForbiddenException,
    );
  });

  it('does not trust stale roles from the token', () => {
    const ctx = new ExecutionContextHost([
      {
        user: { id: 13, role: ['ADMINISTRADOR'], user: { id: 13, roles: [] } },
      },
    ]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
