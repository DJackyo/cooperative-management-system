// src/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
    BadRequestException,
  } from '@nestjs/common';
  import { QueryFailedError } from 'typeorm';
  
  // catch all exceptions
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      let status = 500;
      let message = 'Error interno del servidor';
      let errorPayload: any = null;

      if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.message || message;
        errorPayload = exception.getResponse();
      } else if (exception instanceof QueryFailedError) {
        // handle typeorm errors
        const driverError: any = (exception as any).driverError;
        if (driverError && driverError.code === '23505') {
          // unique violation
          if (driverError.detail && driverError.detail.includes('correo_electronico')) {
            message = 'Ya existe un usuario con ese correo electrónico';
            status = 400;
          } else if (driverError.detail && driverError.detail.includes('numero_de_identificacion')) {
            message = 'Ya existe un asociado con esa identificación';
            status = 400;
          } else {
            message = 'Violación de única restricción en la base de datos';
            status = 400;
          }
        }
        errorPayload = driverError;
      } else if (exception && exception.message) {
        message = exception.message;
      }

      const responseBody = {
        status: 'error',
        message,
        error: errorPayload,
      };

      response.status(status).json(responseBody);
    }
  }
  