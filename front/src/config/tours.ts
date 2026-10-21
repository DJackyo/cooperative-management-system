import { DriveStep } from "driver.js";

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  /** Ruta donde esta guía está disponible (para avisar cuando no corresponde a la pantalla actual). */
  availablePath?: string;
  steps: DriveStep[];
}

/**
 * Muestra la guía automáticamente la primera vez que el usuario visita cada pantalla.
 * Cambiar a `false` para desactivar el inicio automático de todas las guías.
 */
export const AUTO_START_TOURS = true;

// Mapeo de rutas a tours específicos de pantalla
export const PAGE_TOURS: Record<string, TourConfig> = {
  "/": {
    id: "dashboard",
    title: "Guía del Dashboard",
    description: "Aprende a interpretar la información general de la cooperativa.",
    steps: [
      {
        element: '[data-tour="sidebar"]',
        popover: {
          title: "1. Menú Principal",
          description: "Desde el menú lateral accedes a todos los módulos según tus permisos: Dashboard, Ahorros, Créditos, Asociados, Retiros, Certificados, Parámetros y más. Cada pantalla tiene su propia guía con el botón «Guía / Ayuda» de la barra superior.",
          side: "right",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard-welcome"]',
        popover: {
          title: "2. Centro de Control",
          description: "Bienvenida y avisos importantes de la plataforma. Revisa aquí el estado general de la cooperativa antes de empezar a operar.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard-period"]',
        popover: {
          title: "3. Período de Análisis",
          description: "Selecciona el año (o «Todos los años») para que los indicadores, gráficos y tablas del dashboard se filtren por ese período.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard-stats"]',
        popover: {
          title: "4. Indicadores Clave",
          description: "Aquí ves en un vistazo los asociados activos, el total de aportes, la cartera de préstamos y las alertas de mora de la cooperativa.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="dashboard-savings-section"]',
        popover: {
          title: "5. Sección de Ahorros",
          description: "Totales y evolución de los aportes del período. Para crear aportes entra al módulo «Ahorros» desde el menú lateral.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="dashboard-credits-section"]',
        popover: {
          title: "6. Sección de Créditos",
          description: "Solicitudes, aprobaciones y saldos de cartera. Desde el módulo «Créditos» puedes solicitar préstamos, aprobarlos y registrar sus pagos.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="dashboard-users-section"]',
        popover: {
          title: "7. Sección de Asociados",
          description: "Padrón de asociados con su estado y actividad reciente. La gestión completa (crear, editar, inactivar) está en el módulo «Usuarios».",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-projection"]',
        popover: {
          title: "8. Proyección de Ahorros",
          description: "Visualiza la evolución del fondo de ahorro y las estimaciones de crecimiento de la cooperativa.",
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="recent-transactions"]',
        popover: {
          title: "9. Transacciones Recientes",
          description: "Últimos aportes, pagos de cuotas y movimientos registrados. Útil para verificar si una operación recién realizada ya fue cargada al sistema.",
          side: "top",
          align: "start",
        },
      },
      {
        element: '[data-tour="header-tour-btn"]',
        popover: {
          title: "10. Ayuda en Cualquier Pantalla",
          description: "Haz clic para repetir la guía de la pantalla actual. Con la flecha ▾ abres el centro de ayuda para elegir otras guías: Proceso de Préstamo, Registrar Pagos o el Recorrido General.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  },

  "/modules/users": {
    id: "users",
    title: "Guía de Gestión de Asociados",
    description: "Aprende a crear asociados y a usar las acciones disponibles en cada registro.",
    steps: [
      {
        element: '[data-tour="users-page-header"]',
        popover: {
          title: "1. Módulo de Asociados",
          description: "Aquí administras el padrón completo de la cooperativa: creas asociados con su cuenta de acceso, editas sus datos, registras aportes y créditos, y controlas su estado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-stats"]',
        popover: {
          title: "2. Estadísticas Rápidas",
          description: "Muestra los usuarios activos, el total de usuarios registrados y los resultados visibles según los filtros aplicados.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="users-search"]',
        popover: {
          title: "3. Buscador de Asociados",
          description: "Escribe el nombre, correo, número de identificación o ID para filtrar la lista al instante. El botón «Limpiar» restablece los filtros.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-status-filter"]',
        popover: {
          title: "4. Filtro por Estado",
          description: "Filtra por estado del asociado: Todos, Activo, Inactivo, Exasociado, Retirado, RSD o Excluido.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="create-user-btn"]',
        popover: {
          title: "5. Paso a Paso: Crear un Asociado",
          description: "① Haz clic en «Nuevo usuario». ② En «Información del asociado» diligencia: tipo y número de identificación, nombres, estado y si es asociado. ③ En «Acceso al sistema» registra el correo (debe ser único), la contraseña y el rol (Socio, Gestor o Administrador). ④ Pulsa «Crear»: el asociado aparece de inmediato en la tabla con su cuenta de acceso lista para usar. Para modificarlo, repite el proceso desde el menú de la fila.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="users-table"]',
        popover: {
          title: "6. Listado de Asociados",
          description: "Tabla con ID, nombres, correo, rol, estado y número de préstamos de cada asociado. Con «Actualizar Préstamos» recalcas el contador de créditos de todos los registros.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="users-table-actions"]',
        popover: {
          title: "7. Acciones por Registro (⋮)",
          description: "Haz clic en el menú ⋮ de cualquier fila para ejecutar acciones directas: «Editar usuario» (credenciales y rol), «Editar datos del asociado» (perfil completo), «Registrar asistencia a asamblea», «Crear préstamo» (radica un crédito para ese asociado), «Ver préstamos», «Ver aportes», «Crear aporte» (registra un ahorro puntual) e «Inactivar usuario».",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/savings": {
    id: "savings",
    title: "Guía de Ahorros y Aportes",
    description: "Aprende a crear ahorros (individuales y masivos) y a usar las acciones de cada registro.",
    steps: [
      {
        element: '[data-tour="savings-page-header"]',
        popover: {
          title: "1. Módulo de Ahorros",
          description: "Espacio para administrar los aportes periódicos y ahorros programados de los asociados. Puedes crear ahorros de tres formas distintas que verás en los siguientes pasos.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="savings-stats"]',
        popover: {
          title: "2. Métricas de Ahorro",
          description: "Total aportado (acumulado de todos los asociados o del asociado seleccionado), asociados activos, aportes visibles y último aporte registrado.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-search"]',
        popover: {
          title: "3. Filtros de Aportes",
          description: "Busca y depura registros: por asociado (nombre, identificación o ID) o, en el detalle, por texto libre, estado (Activo/Inactivo), método de pago (Efectivo, Transferencia, Tarjeta) y rango de fechas con «Fecha Inicio» y «Fecha Fin».",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="new-bulk-savings-btn"]',
        popover: {
          title: "4. Crear Aportes por Año (Masivo)",
          description: "Paso a paso: ① Haz clic en «Aportes por año». ② Selecciona uno o varios asociados. ③ Elige el año completo o un rango de fechas (los aportes se crean siempre el día 1 de cada mes). ④ Asigna un valor distinto a cada mes. ⑤ Guarda: los aportes aparecen en la tabla y actualizan el total aportado.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="new-aporte-btn"]',
        popover: {
          title: "5. Crear Aportes Individuales o en Masa",
          description: "Paso a paso: ① Haz clic en «Aportes en masa» (vista de administración, para varios asociados) o en «Registrar Aporte» (vista del asociado). ② En el modal: fecha del aporte (el botón 🔄 calcula la próxima fecha según el último aporte), monto, tipo de aporte (Mensual, Anual o Extraordinario) y método de pago (Efectivo, Transferencia o Tarjeta). ③ Si eliges Transferencia o Tarjeta, adjunta el comprobante (obligatorio). ④ Agrega observaciones si lo necesitas y pulsa «Registrar».",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="savings-table"]',
        popover: {
          title: "6. Historial de Aportes",
          description: "Tabla con fecha, monto (en rojo si es negativo), tipo, método, estado y comprobante de cada aporte. Puedes ordenar por columnas, paginar y exportar el listado a Excel.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-table-actions"]',
        popover: {
          title: "7. Acciones por Registro",
          description: "En cada fila encuentras: «Editar» el aporte (corregir fecha, monto, tipo o método), «Ver recibo» (recibo de caja oficial listo para imprimir) y «Ver comprobante» (imagen o PDF cargado en el pago).",
          side: "left",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-detail-btn"]',
        popover: {
          title: "8. Ver Detalle del Asociado",
          description: "Solo en la vista de administración: con «Ver Detalles» entras al historial completo de aportes de ese asociado, donde puedes filtrar, editar y exportar cada registro.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/credit": {
    id: "credit",
    title: "Guía de Créditos y Préstamos",
    description: "Aprende a solicitar créditos, aprobarlos y llegar al registro de pagos.",
    steps: [
      {
        element: '[data-tour="credit-page-header"]',
        popover: {
          title: "1. Módulo de Créditos",
          description: "Gestiona el ciclo completo del préstamo: solicitud, aprobación, amortización, pagos y cierre. Los pasos siguientes te muestran cómo crear un crédito y qué hacer en cada fila.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-stats"]',
        popover: {
          title: "2. Estado de la Cartera",
          description: "Indicadores en tiempo real: solicitudes pendientes de revisión, créditos aprobados, finalizados y los que tienen cuotas vencidas (atención prioritaria).",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-search"]',
        popover: {
          title: "3. Filtros y Reportes",
          description: "Busca por nombre, identificación o ID; filtra por estado (Solicitado, Aprobado, Rechazado, Finalizado) y por situación de pagos (Con mora, Pendientes, Al día). Incluye «Proceso del crédito» (explica el ciclo de vida) y «Generar reporte» (solo administradores).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="new-credit-btn"]',
        popover: {
          title: "4. Paso a Paso: Solicitar un Crédito",
          description: "① Haz clic en «Solicitar crédito». ② Diligencia el monto ($) y el plazo en meses (6 a 48). ③ Selecciona la tasa de interés mensual (parametrizada en Parámetros → Tasa de préstamo); la fecha de vencimiento se calcula sola. ④ Define si aplica Protección de Cartera y agrega observaciones. ⑤ Revisa el plan de amortización que se proyecta automáticamente (capital, interés y cuota mensual) y pulsa «Solicitar Crédito». El préstamo queda en estado SOLICITADO.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="credit-table"]',
        popover: {
          title: "5. Listado de Préstamos",
          description: "Todos los créditos con su asociado, monto, estado y resultados según los filtros. Puedes paginar, ordenar y exportar la información.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-table-actions"]',
        popover: {
          title: "6. Acciones por Registro",
          description: "Según el estado del crédito disponibles: «Aprobar» (solo administrador, en solicitudes SOLICITADAS: fija la fecha de desembolso y genera el plan de pagos), «Recalcular cuotas» (cuando aún no hay pagos), «Finalizar crédito» (si ya no hay cuotas pendientes), «Imprimir crédito» (PDF con el plan e historial) y «Eliminar» (solo administrador).",
          side: "left",
          align: "center",
        },
      },
      {
        element: '[data-tour="open-credit-detail-btn"]',
        popover: {
          title: "7. Ir al Detalle y a los Pagos",
          description: "Con «Ver préstamo» abres la pantalla de detalle del crédito (resumen, condiciones y tabla de cuotas), que es exactamente donde se registran los pagos. Allí puedes seguir la guía «Registrar Pagos».",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/credit/user": {
    id: "credit-user",
    title: "Guía de Pagos y Detalle del Crédito",
    description: "Aprende a consultar el crédito y a registrar pagos de cuotas paso a paso.",
    availablePath: "/modules/credit/user",
    steps: [
      {
        element: '[data-tour="credit-user-header"]',
        popover: {
          title: "1. Detalle del Crédito y Centro de Pagos",
          description: "Llegas a esta pantalla desde Créditos → «Ver préstamo» (o desde «Mis Créditos»). Aquí se consulta todo el crédito y se registran los pagos de sus cuotas.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-user-summary"]',
        popover: {
          title: "2. Resumen del Préstamo",
          description: "Monto total solicitado, plazo en meses y barra de progreso de pago del crédito.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-user-details"]',
        popover: {
          title: "3. Condiciones del Crédito",
          description: "Cuota mensual pactada, tasa de interés aplicada, vigencia de la protección de cartera y fechas clave (crédito y vencimiento).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-user-financial"]',
        popover: {
          title: "4. Resumen de Pagos",
          description: "Valor pagado a la fecha, saldo pendiente por amortizar, cuotas pendientes y el porcentaje ya cancelado del crédito.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="payments-stats"]',
        popover: {
          title: "5. Estadísticas de Cuotas",
          description: "Seguimiento rápido: cuotas Pagadas, Pendientes, Canceladas y Atrasadas. Si hay atrasadas, priorízalas para no generar más mora.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="payments-toolbar"]',
        popover: {
          title: "6. Herramientas de Pagos",
          description: "Buscador de cuotas por número, estado o monto; «Pagos en masa» para registrar varios pagos de una vez; «PDF» para imprimir el historial de pagos y el botón de exportación a Excel.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="pay-cuota-btn"]',
        popover: {
          title: "7. Paso a Paso: Registrar un Pago",
          description: "① Localiza la primera cuota PENDIENTE habilitada y haz clic en «Pagar» (las cuotas se cancelan en orden: solo se habilita si la anterior ya está pagada). ② Se abre el diálogo «Registrar Pago» con el desglose calculado automáticamente: abono a capital, intereses, protección de cartera, mora por días de atraso y total a pagar. ③ Elige el método: Efectivo, Transferencia, Consignación o Nequi/Daviplata. ④ Opcionalmente adjunta el comprobante, agrega un abono extra y observaciones (los administradores pueden ajustar días de mora y protecciones). ⑤ Confirma: la cuota pasa a estado PAGADO y queda su recibo disponible.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="cuota-actions"]',
        popover: {
          title: "8. Acciones por Cuota",
          description: "En cuotas PENDIENTES verás «Pagar». En cuotas PAGADAS: «Ver recibo de pago», «Editar pago» (solo administradores) y «Ver comprobante» cuando se haya adjuntado uno válido (PDF, PNG o JPG). Haz clic en la fila para expandir el desglose de la cuota.",
          side: "left",
          align: "center",
        },
      },
      {
        element: '[data-tour="bulk-payments-btn"]',
        popover: {
          title: "9. Pagos en Masa",
          description: "Registra de una sola vez todos (o varios) pagos pendientes del crédito: selecciona las cuotas, aplica el método de pago y confirma. Ideal para conciliaciones mensuales.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="payments-table"]',
        popover: {
          title: "10. Tabla de Cuotas",
          description: "Cada cuota con número, fecha de vencimiento, monto, mora y estado. Al expandir la fila ves capital, abono extra, intereses, protección, mora, método de pago y observaciones. Usa la paginación inferior para recorrer todo el plan.",
          side: "top",
          align: "center",
        },
      },
    ],
  },

  "/modules/withdrawals": {
    id: "withdrawals",
    title: "Guía de Retiros y Liquidaciones",
    description: "Aprende a crear solicitudes de retiro y a gestionar su aprobación y liquidación.",
    steps: [
      {
        element: '[data-tour="withdrawals-page-header"]',
        popover: {
          title: "1. Módulo de Retiros",
          description: "Gestión de retiros parciales o definitivos de aportes. Antes de finalizar, el sistema cruza los aportes y los créditos del asociado para saber si se paga una devolución o se cobra un saldo.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="withdrawals-tabs"]',
        popover: {
          title: "2. Secciones y Cómo Crear una Solicitud",
          description: "Tres pestañas: «Solicitudes» (seguimiento), «Asociados para retiro» (creación) y «Saldos negativos». Para crear una solicitud: entra a «Asociados para retiro», busca el asociado (debe estar ACTIVO), haz clic en «Solicitar retiro» y diligencia motivo, monto y destino. La solicitud queda en estado PENDIENTE.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="withdrawals-table"]',
        popover: {
          title: "3. Solicitudes Registradas",
          description: "Tabla con asociado, fecha, estado de la solicitud (Pendiente, Aprobada o Rechazada), motivo, motivo de rechazo y resultado del cruce (Pagar devolución / Cobrar saldo). Filtra por estado y exporta a Excel.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="withdrawals-table-actions"]',
        popover: {
          title: "4. Acciones por Solicitud",
          description: "En cada fila: «Ver detalle» de la solicitud; si está PENDIENTE, «Aprobar» o «Rechazar» (con motivo); si está APROBADA, ejecuta el cálculo de liquidación que cruza aportes y créditos. Al confirmar el cruce, el asociado pasa al estado RETIRADO.",
          side: "left",
          align: "center",
        },
      },
      {
        element: '[data-tour="new-withdrawal-btn"]',
        popover: {
          title: "5. Solicitar Retiro (Pestaña de Asociados)",
          description: "Botón «Solicitar retiro» disponible en la pestaña «Asociados para retiro» para cada asociado ACTIVO. Al hacer clic se abre el formulario con el motivo, el monto a retirar y la cuenta de destino.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  },

  "/modules/certificados": {
    id: "certificados",
    title: "Guía de Certificados",
    description: "Generación de certificados de ahorro y crédito en PDF.",
    steps: [
      {
        element: '[data-tour="certificados-page-header"]',
        popover: {
          title: "1. Generador de Certificados",
          description: "Expide documentos oficiales (estado de cuenta) para trámites tributarios o personales del asociado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="certificados-form"]',
        popover: {
          title: "2. Paso a Paso: Generar un Certificado",
          description: "① Busca y selecciona el asociado. ② Elige el tipo de certificado: «Completo (Ahorro y Crédito)», «Solo Ahorro» o «Solo Crédito». ③ Define el rango de fechas «Desde» y «Hasta» que cubrirá el documento. ④ Revisa la vista previa de datos que muestra el sistema.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="download-cert-btn"]',
        popover: {
          title: "3. Descargar o Visualizar",
          description: "Con «Descargar PDF» guardas el certificado con formato oficial listo para imprimir, con «Ver en pestaña nueva» lo abres en el navegador y con «Limpiar» reinicias el formulario.",
          side: "top",
          align: "center",
        },
      },
    ],
  },

  "/modules/admin/backups": {
    id: "backups",
    title: "Guía de Respaldos de Seguridad",
    description: "Aprende a crear y gestionar copias de seguridad de la base de datos.",
    steps: [
      {
        element: '[data-tour="backups-page-header"]',
        popover: {
          title: "1. Gestión de Copias de Seguridad",
          description: "Herramienta administrativa para mantener a salvo toda la información financiera y de socios. Realiza respaldos periódicos y guárdalos fuera del servidor.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="create-backup-btn"]',
        popover: {
          title: "2. Crear Backup",
          description: "Genera una copia de seguridad de la base de datos en tiempo real, comprimida y lista para descargar.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="backups-table"]',
        popover: {
          title: "3. Archivos y Descargas",
          description: "Lista de respaldos almacenados con fecha y tamaño. Haz clic en «Descargar» de cualquier archivo para guardarlo en tu equipo.",
          side: "top",
          align: "center",
        },
      },
    ],
  },

  "/modules/parametros": {
    id: "parametros",
    title: "Guía de Parámetros del Sistema",
    description: "Configuración global de reglas, tipos de documento y variables.",
    steps: [
      {
        element: '[data-tour="parametros-page-header"]',
        popover: {
          title: "1. Parámetros del Sistema",
          description: "Sección para ajustar los datos maestros de la cooperativa. Cualquier cambio aquí impacta los formularios de asociados, ahorros y créditos.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="parametros-content"]',
        popover: {
          title: "2. Listas Configurables",
          description: "Pestañas disponibles: Roles, Tipos de identificación, Estados de asociado, Estados de aprobación, Tipos de familiares, Métodos de pago y Tasas de préstamo. Selecciona la pestaña del catálogo que quieras consultar o modificar.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="parametros-table-actions"]',
        popover: {
          title: "3. Acciones por Registro",
          description: "Crea registros con el botón «Nuevo …» de cada catálogo; en cada fila, «Editar» actualiza sus campos desde el diálogo y «Eliminar» borra el registro (pedirá confirmación). Recuerda que las tasas de préstamo se expresan en decimal y alimentan el cálculo de intereses de los créditos.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/assembly-attendance": {
    id: "assembly-attendance",
    title: "Guía de Asistencia a Asamblea",
    description: "Control de quórum y consulta del registro de asistencia.",
    steps: [
      {
        element: '[data-tour="assembly-page-header"]',
        popover: {
          title: "1. Asistencia a Asamblea",
          description: "Registro oficial de los asociados presentes en las asambleas, utilizado para validar el quórum. Para registrar la asistencia de un asociado, usa el menú ⋮ de la pantalla «Usuarios» → «Registrar asistencia a asamblea».",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="assembly-search"]',
        popover: {
          title: "2. Filtros de Consulta",
          description: "Busca por nombre o identificación, filtra por asistencia (Todas, Asistió, No asistió) y por rango de fechas «Desde» / «Hasta» para localizar cualquier sesión.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="assembly-table"]',
        popover: {
          title: "3. Registro y Exportación",
          description: "Tabla con asociado, identificación, fecha, asistencia y estado de cada registro. Usa la paginación y exporta el listado (Excel) para radicar el acta o el control de quórum.",
          side: "top",
          align: "center",
        },
      },
    ],
  },
};

// Tour general por defecto en caso de no estar definido para una ruta específica
export const GENERAL_TOUR: TourConfig = {
  id: "general",
  title: "Guía de la Plataforma COOPINSI",
  description: "Recorrido básico por los elementos principales de la aplicación.",
  steps: [
    {
      element: '[data-tour="sidebar"]',
      popover: {
        title: "Menú de Navegación",
        description: "Utilice la barra lateral para desplazarse entre los diferentes módulos disponibles.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="header-title"]',
      popover: {
        title: "Barra Superior",
        description: "Indica la sección actual e información de la cooperativa.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="header-user"]',
      popover: {
        title: "Usuario Activo",
        description: "Muestra tu usuario en sesión e información de tu perfil.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="header-tour-btn"]',
      popover: {
        title: "Centro de Ayuda",
        description: "Haz clic aquí en cualquier pantalla para iniciar la guía interactiva correspondiente.",
        side: "bottom",
        align: "end",
      },
    },
  ],
};

// Tour explicativo del proceso y ciclo de vida de un préstamo
export const CREDIT_WORKFLOW_TOUR: TourConfig = {
  id: "credit-workflow",
  title: "Ciclo de Vida de un Préstamo",
  description: "Explicación paso a paso de cómo funciona una solicitud de crédito.",
  availablePath: "/modules/credit",
  steps: [
    {
      element: '[data-tour="credit-page-header"]',
      popover: {
        title: "📌 1. Introducción al Proceso de Crédito",
        description: "Un préstamo en la cooperativa recorre 4 fases principales: Solicitud 📝 -> Aprobación 🔍 -> Pagos/Amortización 💳 -> Cierre/Finalización 🏁.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="new-credit-btn"]',
      popover: {
        title: "📝 2. Radicación de la Solicitud (SOLICITADO)",
        description: "El asociado o el administrador diligencia la solicitud indicando el monto deseado ($), plazo en meses y tasa de interés mensual. El préstamo inicia en estado 'SOLICITADO'.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="credit-stats"]',
      popover: {
        title: "🔍 3. Evaluación y Aprobación (APROBADO)",
        description: "La administración evalúa el cupo de crédito y la capacidad de pago. Al ser aprobado, cambia a 'APROBADO', se fija la fecha de desembolso y el sistema proyecta el plan de amortización.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="credit-table"]',
      popover: {
        title: "💳 4. Amortización y Registro de Pagos",
        description: "Cada mes el socio realiza sus pagos. La cuota desglosa automáticamente: Abono a Capital, Interés Corriente, Protección de Cartera (seguro) y Mora si aplica.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="credit-table-actions"]',
      popover: {
        title: "🏁 5. Cierre y Finalización (FINALIZADO)",
        description: "Al completar el pago del 100% del capital e intereses, el crédito cambia a estado 'FINALIZADO', cerrando la obligación y quedando guardado en el historial.",
        side: "left",
        align: "center",
      },
    },
  ],
};

/**
 * Guía específica para registrar pagos de cuotas.
 * Disponible en el detalle del crédito (Créditos → «Ver préstamo»).
 */
export const PAYMENTS_TOUR: TourConfig = {
  id: "payments",
  title: "Cómo Registrar un Pago",
  description: "Paso a paso para pagar cuotas, usar pagos en masa y descargar recibos. Disponible en el detalle de un crédito (Créditos → «Ver préstamo»).",
  availablePath: "/modules/credit/user",
  steps: [
    {
      element: '[data-tour="payments-stats"]',
      popover: {
        title: "1. Estado de las Cuotas",
        description: "Revisa primero cuántas cuotas están Pagadas, Pendientes, Canceladas y Atrasadas. Si hay cuotas atrasadas, pagalas primero para detener la mora.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="payments-toolbar"]',
      popover: {
        title: "2. Herramientas de Pago",
        description: "Busca una cuota por número, estado o monto; con «PDF» imprimes el historial de pagos y con el icono de exportación lo descargas en Excel.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="pay-cuota-btn"]',
      popover: {
        title: "3. Paso a Paso: Pagar una Cuota",
        description: "① Haz clic en «Pagar» de la primera cuota PENDIENTE habilitada (las cuotas se cancelan en orden). ② En el diálogo «Registrar Pago» el sistema calcula solo: capital, intereses, protección de cartera, mora y total a pagar. ③ Elige el método (Efectivo, Transferencia, Consignación o Nequi/Daviplata). ④ Adjunta comprobante, agrega abono extra u observaciones si aplica. ⑤ Confirma: la cuota pasa a PAGADO.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="cuota-actions"]',
      popover: {
        title: "4. Acciones por Cuota",
        description: "Pendiente: «Pagar». Pagada: «Ver recibo de pago», «Editar pago» (administradores) y «Ver comprobante». Haz clic en la fila para expandir el desglose completo de la cuota.",
        side: "left",
        align: "center",
      },
    },
    {
      element: '[data-tour="bulk-payments-btn"]',
      popover: {
        title: "5. Pagos en Masa",
        description: "Registra de una sola vez varios pagos pendientes del crédito: selecciona las cuotas, aplica el método de pago y confirma.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="payments-table"]',
      popover: {
        title: "6. Plan de Pagos Completo",
        description: "Aquí ves todas las cuotas con su vencimiento, monto, mora y estado. El resumen superior (credit-user-financial) refleja el saldo pagado y pendiente al instante.",
        side: "top",
        align: "center",
      },
    },
  ],
};

/**
 * Obtiene la configuración del tour adecuada según el pathname de Next.js
 */
export function getTourForPath(pathname: string): TourConfig {
  // Limpiar query params si existen en la cadena
  const cleanPath = pathname.split("?")[0];

  if (PAGE_TOURS[cleanPath]) {
    return PAGE_TOURS[cleanPath];
  }

  // Búsqueda por prefijo (ejemplo: /modules/savings?id=123)
  const matchedKey = Object.keys(PAGE_TOURS).find(
    (key) => key !== "/" && cleanPath.startsWith(key)
  );

  if (matchedKey) {
    return PAGE_TOURS[matchedKey];
  }

  return GENERAL_TOUR;
}
