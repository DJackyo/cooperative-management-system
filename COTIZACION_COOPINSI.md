# COTIZACIÓN COMERCIAL
## Sistema de Gestión Cooperativa - COOPINSI

**Fecha:** 20 de octubre de 2026  
**Versión del sistema:** 1.0  
**Validez de la oferta:** 30 días calendario  
**Moneda:** Pesos colombianos (COP)

---

## 1. DESCRIPCIÓN DEL PROYECTO

**COOPINSI** es una aplicación integral de gestión cooperativa diseñada para administrar socios, aportes, ahorros, préstamos, cuotas, pagos, recibos y reportes contables. Está compuesta por:

- **Backend:** API desarrollada con NestJS (Node.js), TypeORM y PostgreSQL, con autenticación JWT, control de roles (RBAC) y tareas programadas.
- **Frontend:** Interfaz web desarrollada con Next.js 16, Material UI (MUI) y TypeScript, con gráficos interactivos, tablas de datos, exportación a PDF/Excel y módulo de respaldos.
- **Base de datos:** PostgreSQL con 24 entidades y esquema relacional estructurado.
- **Módulos backend:** 17 módulos funcionales (usuarios, roles, autenticación, dashboard, asociados, aportes, ahorros, préstamos, cuotas, pagos, métodos de pago, recibos, retiros, estados de cuenta, tipos de documento, tipos familiares y scheduler).

---

## 2. ALCANCE FUNCIONAL INCLUIDO

| Módulo | Funcionalidades principales |
|--------|----------------------------|
| **Usuarios y Roles** | Registro, edición, asignación de permisos, control de acceso por roles (RBAC) |
| **Autenticación** | Login con JWT, recuperación de contraseña, sesiones seguras |
| **Asociados** | Gestión de socios, datos personales, tipos de documento, estados civiles |
| **Aportes** | Registro de aportes de capital, historial por asociado |
| **Ahorros** | Cuentas de ahorro, movimientos, saldos |
| **Préstamos** | Solicitud, aprobación, amortización, seguimiento de cartera |
| **Cuotas** | Generación de cuotas de préstamos, pagos parciales, morosidad |
| **Pagos** | Registro de pagos, métodos de pago, comprobantes |
| **Recibos** | Emisión de recibos automáticos, descarga en PDF |
| **Retiros** | Solicitud y autorización de retiros de ahorros |
| **Estados de cuenta** | Consolidado de movimientos por asociado |
| **Dashboard** | Indicadores clave, gráficos de cartera, morosidad y ahorros |
| **Tareas programadas** | Procesos automáticos (cobro de cuotas, notificaciones, cierres) |
| **Respaldos** | Exportación de base de datos y archivos, descarga de backups |

---

## 3. OPCIONES DE PRECIO

### Opción A: Licencia de Software (On-Premise / Instalación propia)

| Concepto | Precio (COP) |
|----------|-------------|
| Licencia de uso por cooperativa | $14.000.000 – $24.000.000 |
| Instalación y configuración inicial en servidor local o cloud | $2.000.000 – $6.000.000 |
| Capacitación básica para administradores (hasta 4 horas) | $3.000.000 – $5.000.000 |
| **Total estimado Opción A** | **$19.000.000 – $35.000.000** |

**Incluye:** Código fuente, documentación técnica, instalación en un entorno, capacitación inicial y 30 días de soporte post-implementación.

### Opción B: Modelo SaaS (Suscripción mensual, hosting incluido)

| Plan | Usuarios | Almacenamiento | Precio mensual (COP) |
|------|----------|----------------|---------------------|
| **Básico** | Hasta 10 usuarios | 5 GB | $320.000 – $480.000 |
| **Profesional** | Hasta 50 usuarios | 20 GB | $600.000 – $1.000.000 |
| **Empresarial** | Ilimitados | 100 GB + | $1.200.000 – $2.000.000 |

**Incluye:** Hosting en la nube, actualizaciones automáticas, respaldos diarios, soporte técnico por correo y acceso web desde cualquier dispositivo.

### Opción C: Desarrollo a Medida (Personalización sobre COOPINSI)

| Servicio | Precio estimado (COP) |
|----------|----------------------|
| Personalizaciones menores (campos, reportes, logos) | $6.000.000 – $20.000.000 |
| Integraciones con pasarelas de pago bancarias | $12.000.000 – $32.000.000 |
| App móvil complementaria (React Native / Flutter) | $32.000.000 – $60.000.000 |
| Multi-inquilino (varias cooperativas en una instancia) | $20.000.000 – $48.000.000 |
| Migración de datos desde sistema legacy | $8.000.000 – $24.000.000 |

### Opción D: Desarrollo desde Cero (equivalente a COOPINSI)

Si el cliente requiere un sistema similar construido desde cero para sus necesidades específicas:

| Alcance | Horas estimadas | Precio estimado (COP) |
|---------|----------------|----------------------|
| Sistema completo (MVP) | 500 – 700 hrs | $60.000.000 – $140.000.000 |
| Sistema con personalizaciones avanzadas | 700 – 1,000 hrs | $140.000.000 – $240.000.000 |

**Tiempo estimado de entrega:** 3 a 6 meses.

---


## 4. SERVICIOS ADICIONALES

| Servicio | Precio (COP) |
|----------|-------------|
| Mantenimiento y soporte anual (15% del valor de licencia) | 15% del valor / año |
| Soporte técnico por hora | $200.000 – $320.000 |
| Capacitación avanzada adicional | $1.200.000 – $2.400.000 /sesión |
| Despliegue en producción (Render, Vercel, AWS, etc.) | $1.600.000 – $4.000.000 |

## 5. TIEMPOS ESTIMADOS DE ENTREGA

| Fase | Tiempo estimado |
|------|----------------|
| Análisis de requisitos y firma de contrato | 1 semana |
| Instalación y configuración (Opción A) | 1 – 2 semanas |
| Personalizaciones menores | 2 – 4 semanas |
| Capacitación y puesta en marcha | 1 semana |
| Soporte post-implementación | 30 días |

## 6. TÉRMINOS Y CONDICIONES

1. **Pago:** Se sugiere un adelanto del 50% al iniciar el proyecto y el 50% restante al momento de la entrega y aceptación.
2. **Soporte:** Incluye 30 días de soporte post-entrega para corrección de errores críticos.
3. **Hosting:** Para la Opción A, el cliente es responsable del servidor y la base de datos. Para la Opción B, el hosting está incluido en la suscripción.
4. **Propiedad intelectual:** El código fuente de COOPINSI permanece como propiedad del desarrollador; el cliente adquiere una licencia de uso.
5. **Exclusiones:** No incluye integraciones con bancos terceros, firmas digitales, ni almacenamiento externo de archivos (S3, Cloudinary) salvo que se contraten como adicionales.

## 7. CONTACTO Y APROBACIÓN

**Desarrollador / Empresa:** ___________________________________  
**Cliente:** ___________________________________  
**Fecha:** ___________________________________  
**Firma:** ___________________________________

---

*Esta cotización es una referencia comercial basada en el alcance actual del sistema COOPINSI. Los precios pueden variar según la complejidad de las personalizaciones requeridas y la ubicación geográfica del cliente.*
