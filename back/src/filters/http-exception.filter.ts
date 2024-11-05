// src/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
  } from '@nestjs/common';
  
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
  
      const responseBody = {
        status: 'error',
        message: exception.message || 'Error interno del servidor',
        error: exception.getResponse(),
      };
  
      response.status(status).json(responseBody);
    }
  }
  