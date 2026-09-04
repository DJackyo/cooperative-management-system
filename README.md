# COOPINSI

Aplicacion de gestion cooperativa con un backend NestJS, un frontend Next.js y una base de datos PostgreSQL.

## Estructura

```text
coop-app/
├── back/       # API NestJS
├── front/      # Aplicacion Next.js
└── render.yaml # Configuracion opcional del backend en Render
```

## Requisitos en Windows

Instala previamente:

- Node.js 22 LTS
- PostgreSQL
- Git

Habilita `pnpm` desde PowerShell:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

Comprueba las versiones:

```powershell
node --version
pnpm --version
psql --version
```

## Configurar PostgreSQL local

Crea una base de datos llamada `coop` y verifica que el usuario y la contrasena coincidan con `back/.env`.

Ejemplo de configuracion local en `back/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=coop
DB_LOGGING=true
IS_PROD=false
PORT=5001
JWT_SECRET=your-local-secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://tu-frontend.vercel.app
```

Si la base de datos esta vacia, ejecuta los scripts SQL ubicados en `back/database/migrations` en el orden necesario para tu esquema.

No subas el archivo `.env` al repositorio. Usa `back/.env.example` como referencia.

## Instalar dependencias

Backend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\back
pnpm install
```

Frontend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\front
pnpm install
```

El proyecto ya incluye `@nestjs/cli` en las dependencias del backend. No es necesario instalar Nest globalmente con `npm install -g @nestjs/cli`.

## Variables del frontend

Crea `front/.env.local` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Ejecucion en desarrollo

Inicia el backend en una terminal:

```powershell
cd C:\_JACK\COOPINSI\coop-app\back
pnpm run start:dev
```

Inicia el frontend en otra terminal:

```powershell
cd C:\_JACK\COOPINSI\coop-app\front
pnpm run start:dev
```

URLs locales:

- Frontend: http://localhost:4000
- Backend: http://localhost:5001

## Ejecucion local como produccion

Este flujo compila primero y luego inicia las aplicaciones sin modo watch.

Compila el backend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\back
pnpm install --frozen-lockfile
pnpm run build
pnpm run start:prod
```

En otra terminal, compila e inicia el frontend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\front
pnpm install --frozen-lockfile
pnpm run build
pnpm run start -- -p 4000
```

## Mantener la aplicacion ejecutandose con PM2

PM2 permite que los procesos sigan ejecutandose aunque se cierre la terminal y reinicia procesos que fallen.

Instalacion:

```powershell
npm install -g pm2
```

Compila ambos proyectos antes de iniciarlos:

```powershell
cd C:\_JACK\COOPINSI\coop-app\back
pnpm install --frozen-lockfile
pnpm run build

cd C:\_JACK\COOPINSI\coop-app\front
pnpm install --frozen-lockfile
pnpm run build
```

Inicia el backend y el frontend:

```powershell
pm2 start dist/main.js --name coop-backend --cwd C:\_JACK\COOPINSI\coop-app\back
pm2 start pnpm --name coop-frontend --cwd C:\_JACK\COOPINSI\coop-app\front -- start -p 4000
```

Comandos utiles:

```powershell
pm2 list
pm2 logs coop-backend
pm2 logs coop-frontend
pm2 restart coop-backend
pm2 restart coop-frontend
pm2 stop coop-backend
pm2 stop coop-frontend
pm2 delete coop-backend
pm2 delete coop-frontend
```

Guarda la lista de procesos:

```powershell
pm2 save
```

Para iniciar PM2 automaticamente con Windows, instala el complemento y guarda nuevamente los procesos:

```powershell
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

## Despliegue del backend en Render

Se puede desplegar solamente `back`. Mantén `render.yaml` en la raiz del repositorio:

```text
coop-app/
├── render.yaml
├── back/
└── front/
```

En Render configura un servicio Web con:

```text
Root Directory: back
Build Command: corepack enable && pnpm install --frozen-lockfile --prod=false && pnpm run build
Start Command: pnpm run start:prod
```

`@nestjs/cli` se instala desde `back/package.json`; no necesitas instalar Nest globalmente en Render.

Variables recomendadas en Render:

```env
NODE_VERSION=22.14.0
PORT=10000
IS_PROD=true
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
DB_LOGGING=false
JWT_SECRET=un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=24h
```

La base de datos puede ser Render PostgreSQL, Supabase, Neon u otro PostgreSQL accesible desde Render.

Despues de actualizar dependencias o el lockfile, usa **Clear build cache & deploy** en Render si el servicio conserva una instalacion anterior.

## Frontend conectado al backend desplegado

Si el frontend se publica en Vercel u otro proveedor, configura durante el build:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

El backend debe permitir en CORS el dominio real del frontend. Actualmente la configuracion local permite `localhost:4000` y `localhost:3000`.

## Archivos y backups

Los comprobantes se guardan en `back/uploads` y los backups en `back/backups`. En un servidor cloud no se debe depender del almacenamiento local del servicio, porque puede perderse al redesplegar o reiniciar.

Para produccion usa almacenamiento persistente externo, por ejemplo:

- Supabase Storage
- Amazon S3
- Cloudinary

Guarda tambien los backups en un almacenamiento externo.

## Verificacion antes de publicar

Backend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\back
pnpm install --frozen-lockfile
pnpm run build
```

Frontend:

```powershell
cd C:\_JACK\COOPINSI\coop-app\front
pnpm install --frozen-lockfile
pnpm run build
```

No uses credenciales locales, secretos de ejemplo ni `localhost` en las variables de produccion.
