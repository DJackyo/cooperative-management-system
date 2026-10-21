This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

## Depurar aportes duplicados

Disponible para **ADMINISTRADOR** y **GESTOR DE OPERACIONES** en
**Gestion de Ahorros > Depurar duplicados**, tanto en la lista general como en el
historial de un asociado. Requiere el backend actualizado y la
[migracion de auditoria](../back/database/migrations/create_asoc_aportes_depuraciones.sql).

1. Buscar por asociado, identificacion o ID de aporte, y filtrar por mes/ano.
2. Marcar los registros que se desean **eliminar**. No hay seleccion automatica
   y siempre debe conservarse al menos uno por asociado y mes.
3. Pulsar **Revisar seleccion**: muestra todos los grupos seleccionados, incluso
   los de otras paginas o filtros, con lo que se elimina y lo que se conserva.
4. Revisar importes, soportes, observaciones y metodos; indicar un motivo y escribir
   `ELIMINAR` para confirmar el borrado real.

La seleccion persiste al paginar o filtrar, pero se limpia al actualizar, cerrar
o producirse un error de borrado. Ante un conflicto se exige actualizar y volver
a seleccionar. Al completarse, se muestra el identificador de auditoria y se
actualizan los saldos. No se consolidan pagos ni se trasladan soportes; la auditoria
conserva la informacion original y los archivos no se eliminan.
Cancelar una consulta al cerrar o actualizar el dialogo no genera una alerta ni
un error de consola; los errores reales de la API siguen notificandose.

La lista incluye todos los estados y tipos de aporte; un mes repetido no demuestra
por si solo que un pago sea erroneo. Revisar y respaldar antes de confirmar.

## Development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
