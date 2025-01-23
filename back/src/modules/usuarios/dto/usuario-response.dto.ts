export class UsuarioResponseDto {
  id: number;
  username: string;
  correoElectronico: string;
  fechaRegistro: Date | null;
  fechaModificacion: Date | null;
  roles: { id: number; nombre: string }[];
  idAsociado: {
    nombres: string;
    numeroDeIdentificacion: string | number;
    idEstado: object;
  };
}
