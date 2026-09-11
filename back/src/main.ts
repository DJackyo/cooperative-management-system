process.env.TZ = 'America/Bogota';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: (requestOrigin, callback) => {
      const configuredOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '');
      const allowedOrigins = [
        'http://localhost:4000',
        'http://localhost:3000',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:3000',
        ...(configuredOrigin ? [configuredOrigin] : []),
      ];
      const isVercelDeployment =
        requestOrigin?.match(
          /^https:\/\/cooperative-management-system-[a-z0-9-]+\.vercel\.app$/,
        ) !== null;

      if (!requestOrigin || allowedOrigins.includes(requestOrigin) || isVercelDeployment) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
  });
  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 5001);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
}
bootstrap();
