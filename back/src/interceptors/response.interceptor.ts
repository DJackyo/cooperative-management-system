// src/interceptors/response.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  interface ApiResponse<T> {
    status: string;
    data?: T;
    message?: string;
  }
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
  
      return next.handle().pipe(
        map((data) => {
          return {
            status: 'success',
            data,
            message: `Request to ${request.url} was successful`,
          };
        }),
      );
    }
  }
  