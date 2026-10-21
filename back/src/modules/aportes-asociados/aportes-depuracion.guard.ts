import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

export interface SolicitudDepuracion extends Request {
  user: {
    id: number;
    user: { id: number; roles: { nombre: string }[] };
  };
}

@Injectable()
export class AportesDepuracionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<SolicitudDepuracion>();
    const autorizado = user?.user?.roles?.some((role) =>
      ['ADMINISTRADOR', 'GESTOR DE OPERACIONES'].includes(role.nombre),
    );
    if (!autorizado || !Number.isInteger(user.user.id) || user.user.id < 1) {
      throw new ForbiddenException('No tiene permisos para depurar ahorros');
    }
    return true;
  }
}
