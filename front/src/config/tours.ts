import { DriveStep } from "driver.js";

export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: DriveStep[];
}

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
          title: "Menú Principal",
          description: "Desde el menú lateral puedes acceder a todos los módulos según tus permisos (Dashboard, Ahorros, Créditos, Asociados, Parámetros y más).",
          side: "right",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard-welcome"]',
        popover: {
          title: "Centro de Control",
          description: "Bienvenido al resumen operativo en tiempo real. Aquí verás avisos importantes y el estado general de la plataforma.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="dashboard-stats"]',
        popover: {
          title: "Indicadores Clave",
          description: "Consulta el número de asociados activos, total de aportes reunidos y saldo total de cartera de préstamos.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-projection"]',
        popover: {
          title: "Proyección de Ahorros",
          description: "Visualiza la evolución del fondo de ahorro y estimaciones de crecimiento de la cooperativa.",
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="recent-transactions"]',
        popover: {
          title: "Transacciones Recientes",
          description: "Consulte las consignaciones, aportes y movimientos más recientes registrados por los asociados.",
          side: "top",
          align: "start",
        },
      },
      {
        element: '[data-tour="header-tour-btn"]',
        popover: {
          title: "Ayuda en cualquier pantalla",
          description: "Puedes volver a lanzar esta guía interactiva cuando quieras haciendo clic en este botón de ayuda.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  },

  "/modules/users": {
    id: "users",
    title: "Guía de Gestión de Asociados",
    description: "Conoce cómo administrar asociados, cuentas y perfiles.",
    steps: [
      {
        element: '[data-tour="users-page-header"]',
        popover: {
          title: "Módulo de Asociados",
          description: "Aquí administras el padrón completo de asociados de la cooperativa, sus credenciales y estado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-stats"]',
        popover: {
          title: "Estadísticas Rápidas",
          description: "Observa el recuento de asociados activos, inactivos y la cantidad de socios registrados.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="users-search"]',
        popover: {
          title: "Buscador de Asociados",
          description: "Escribe el nombre, número de identificación o correo electrónico para filtrar rápidamente la lista.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="users-status-filter"]',
        popover: {
          title: "Filtros por Estado",
          description: "Filtra la lista según el estado actual del asociado (ACTIVO, INACTIVO, RETIRADO, etc.).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="create-user-btn"]',
        popover: {
          title: "Registrar Asociado",
          description: "Haga clic aquí para registrar un nuevo asociado con sus datos personales, dirección, contacto y familiares.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="users-table"]',
        popover: {
          title: "Listado de Asociados",
          description: "Muestra la tabla de socios con su identificación, estado, rol y menú de acciones individuales.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="users-table-actions"]',
        popover: {
          title: "Acciones por Asociado",
          description: "Haz clic en el menú de opciones (⋮) de cualquier fila para realizar acciones directas: editar datos personales, registrar asistencia a asamblea, solicitar crédito, abonar aportes o inactivar la cuenta.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/savings": {
    id: "savings",
    title: "Guía de Ahorros y Aportes",
    description: "Aprende a gestionar aportes ordinarios, extraordinarios y metas de ahorro.",
    steps: [
      {
        element: '[data-tour="savings-page-header"]',
        popover: {
          title: "Módulo de Ahorros",
          description: "Espacio para administrar los aportes periódicos y ahorros programados de los asociados.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="savings-stats"]',
        popover: {
          title: "Métricas de Ahorro",
          description: "Visualiza el valor consolidado de aportes, ahorros acumulados y cumplimientos de metas.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-search"]',
        popover: {
          title: "Filtros de Aportes",
          description: "Busca aportes específicos por asociado, número de comprobante o estado.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="new-aporte-btn"]',
        popover: {
          title: "Registrar Aporte",
          description: "Genera una nueva consignación de ahorro adjuntando comprobante y forma de pago.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="savings-table"]',
        popover: {
          title: "Historial de Aportes",
          description: "Tabla interactiva con los detalles de las consignaciones, comprobantes cargados y estado de aprobación.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="savings-table-actions"]',
        popover: {
          title: "Acciones en Ahorros",
          description: "En cada fila de la lista puedes utilizar los botones de acción para: ver el detalle acumulado, consultar el comprobante de pago cargado o generar el recibo de caja oficial.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/credit": {
    id: "credit",
    title: "Guía de Créditos y Préstamos",
    description: "Conoce cómo solicitar préstamos, ver el plan de pagos y revisar autorizaciones.",
    steps: [
      {
        element: '[data-tour="credit-page-header"]',
        popover: {
          title: "Módulo de Créditos",
          description: "Gestione las solicitudes de crédito, amortización, líneas de préstamo y desembolsos.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-stats"]',
        popover: {
          title: "Estado de la Cartera",
          description: "Resumen numérico de créditos solicitados, en revisión, aprobados y saldo total de la cartera.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-search"]',
        popover: {
          title: "Búsqueda de Créditos",
          description: "Busca por nombre del deudor, número de solicitud o estado del crédito.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="new-credit-btn"]',
        popover: {
          title: "Solicitar Nuevo Crédito",
          description: "Radique un nuevo préstamo calculando valor, plazo, tasa de interés y cuota proyectada.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="credit-table"]',
        popover: {
          title: "Listado de Préstamos",
          description: "Consulte el plan de pagos, saldo de capital, intereses generados y opciones de amortización.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-table-actions"]',
        popover: {
          title: "Acciones de Crédito",
          description: "Desde las opciones de cada fila puedes: revisar y aprobar solicitudes pendientes, ver la tabla de amortización y cuotas, imprimir el historial completo de pagos en PDF, recalcular cuotas o eliminar el préstamo.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/credit/user": {
    id: "credit-user",
    title: "Guía de Mis Créditos",
    description: "Consulta tus préstamos activos, cuotas pendientes y tabla de amortización.",
    steps: [
      {
        element: '[data-tour="credit-user-header"]',
        popover: {
          title: "Mis Préstamos",
          description: "Pantalla personal donde puedes ver el estado de tus créditos solicitados y cuotas vigentes.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-user-summary"]',
        popover: {
          title: "Resumen Principal del Crédito",
          description: "Muestra el monto total solicitado, plazo en meses y la barra de progreso de pago.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="credit-user-details"]',
        popover: {
          title: "Datos y Condiciones del Crédito",
          description: "Consulte la cuota mensual pactada, tasa de interés aplicada, vigencia de protección de cartera y fechas clave.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="credit-user-financial"]',
        popover: {
          title: "Resumen de Pagos y Saldos",
          description: "Visualice el valor pagado a la fecha, saldo pendiente por amortizar y número de cuotas restantes.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="credit-user-table"]',
        popover: {
          title: "Tabla de Cuotas e Historial de Amortización",
          description: "Detalle de cada cuota con desglose de abono a capital, intereses generados, seguro de cartera y estado de pago.",
          side: "top",
          align: "center",
        },
      },
    ],
  },

  "/modules/withdrawals": {
    id: "withdrawals",
    title: "Guía de Retiros y Liquidaciones",
    description: "Administra las solicitudes de retiro de aportes de los asociados.",
    steps: [
      {
        element: '[data-tour="withdrawals-page-header"]',
        popover: {
          title: "Módulo de Retiros",
          description: "Gestión de solicitudes de retiro parcial o definitivo de asociados.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="new-withdrawal-btn"]',
        popover: {
          title: "Nueva Solicitud de Retiro",
          description: "Crear una solicitud especificando el motivo, monto a retirar y cuenta de destino.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="withdrawals-table"]',
        popover: {
          title: "Solicitudes Registradas",
          description: "Revise el flujo de revisión, aprobación y comprobantes de desembolso por la administración.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="withdrawals-table-actions"]',
        popover: {
          title: "Acciones en Solicitudes de Retiro",
          description: "Utilice los botones de acción para: ver el detalle de la solicitud, aprobar o rechazar el retiro, y ejecutar el cálculo automático de liquidación de saldos.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/certificados": {
    id: "certificados",
    title: "Guía de Certificados",
    description: "Generación de certificados de aportes y retenciones en PDF.",
    steps: [
      {
        element: '[data-tour="certificados-page-header"]',
        popover: {
          title: "Generador de Certificados",
          description: "Expide documentos oficiales firmados para trámites tributarios o personales.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="certificados-form"]',
        popover: {
          title: "Filtros y Opciones",
          description: "Selecciona el asociado, el tipo de certificado (Aportes, Saldo de Crédito, Retención) y el año gravable.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="download-cert-btn"]',
        popover: {
          title: "Descargar PDF",
          description: "Descargue directamente el certificado digital con formato oficial para imprimir.",
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
          title: "Gestión de Copias de Seguridad",
          description: "Herramienta administrativa para mantener a salvo toda la información financiera y de socios.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="create-backup-btn"]',
        popover: {
          title: "Crear Backup",
          description: "Genera una copia de seguridad en tiempo real comprimida y lista para descargar.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="backups-table"]',
        popover: {
          title: "Archivos Disponibles y Descargas",
          description: "Lista de backups almacenados con fecha y tamaño. Haz clic en el botón 'Descargar' de cualquier archivo para guardarlo en tu equipo.",
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
          title: "Parámetros del Sistema",
          description: "Sección para ajustar los datos maestros de la cooperativa.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="parametros-content"]',
        popover: {
          title: "Listas Configurables",
          description: "Administra tipos de identificación, parentescos familiares, estados y configuraciones de aportes.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="parametros-table-actions"]',
        popover: {
          title: "Acciones de Edición y Borrado",
          description: "En cada fila de la lista de catálogo puedes hacer clic en 'Editar' para actualizar el nombre o valor, o 'Eliminar' para remover el registro.",
          side: "left",
          align: "center",
        },
      },
    ],
  },

  "/modules/assembly-attendance": {
    id: "assembly-attendance",
    title: "Guía de Asistencia a Asamblea",
    description: "Control de quórum y registro de asistencia en tiempo real.",
    steps: [
      {
        element: '[data-tour="assembly-page-header"]',
        popover: {
          title: "Asistencia a Asamblea",
          description: "Registro oficial de asociados presentes para validación de quórum.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="assembly-search"]',
        popover: {
          title: "Registro Rápido",
          description: "Busque por cédula o nombre para confirmar la presencia del asociado en la asamblea.",
          side: "bottom",
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
