import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Skeleton,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Chip,
  Avatar,
  Divider,
  Alert,
  Fade,
  LinearProgress,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as XLSX from "xlsx-js-style";
import UserCard from "../../utilities/UserCard";
import { Asociado, LoggedUser } from "@/interfaces/User";
import { Prestamo } from "@/interfaces/Prestamo";
import { authService } from "@/app/authentication/services/authService";
import { logoBase64 } from "@/app/(DashboardLayout)/utilities/logoBase64";
import {
  defaultLoggedUser,
  formatCurrency,
  formatDateTime,
  formatDateWithoutTime,
  formatNameDate,
  getComparator,
  getEstadoChip,
  redondearHaciaArriba,
  roleAdmin,
  validateRoles,
} from "../../utilities/utils";
import {
  IconChecks,
  IconEyeDollar,
  IconPencilDollar,
  IconX,
  IconTrash,
  IconFileReport,
  IconFileDownload,
  IconRefresh,
  IconSearch,
  IconPrinter,
  IconFilter,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconCash,
  IconPlus,
  IconUserCircle,
  IconListDetails,
  IconCalculator,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { creditsService } from "@/services/creditRequestService";
import { userService } from "@/services/userService";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import GenericLoadingSkeleton from "@/components/GenericLoadingSkeleton";
import { usePageLoading } from "@/hooks/usePageLoading";
import StyledTable from "@/components/StyledTable";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import ModuleStatCard from "@/app/(DashboardLayout)/components/shared/ModuleStatCard";

// Componente cargado dinámicamente
const CreditForm = dynamic(() => import("./components/CreditForm"), {
  ssr: false,
});

interface CreditModuleProps {
  userId: number;
}

const CreditModule: React.FC<CreditModuleProps> = ({ userId }) => {
  const router = useRouter();
  const { loading, stopLoading } = usePageLoading();

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [openModifyModal, setOpenModifyModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [userInfo, setUserInfo] = useState<Asociado>({
    id: 0,
    nombres: "",
    numeroDeIdentificacion: "",
    idEstado: { id: 1, estado: "" },
  });
  const [credits, setCredits] = useState<Prestamo[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
  const [currentUser, setCurrentUser] = useState<LoggedUser>(defaultLoggedUser);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("fechaCredito");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [paymentFilter, setPaymentFilter] = useState("TODOS");
  const [refreshing, setRefreshing] = useState(false);
  const [tasas, setTasas] = useState<any[]>([]);

  const sortedCredits = [...credits].sort((a, b) => {
    const fechaA = a.fechaCredito ? new Date(a.fechaCredito).getTime() : 0;
    const fechaB = b.fechaCredito ? new Date(b.fechaCredito).getTime() : 0;
    return fechaB - fechaA;
  });

  const loadCredits = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = userId === 0 ? await creditsService.fetchAll() : await creditsService.fetchByUser(userId);

      if (response) {
        setCredits(response);
        if (response.length > 0) {
          setUserInfo(response[0].idAsociado);
        } else if (userId > 0) {
          try {
            const userResp: any = await userService.fetchById(userId);
            const asoci = userResp?.idAsociado || userResp;
            if (asoci) {
              const nombres = [asoci.nombre1, asoci.nombre2, asoci.apellido1, asoci.apellido2].filter(Boolean).join(' ');
              setUserInfo({
                id: asoci.id || userId,
                nombres: nombres || asoci.nombres || '',
                numeroDeIdentificacion: asoci.numeroDeIdentificacion || '',
                idEstado: asoci.idEstado || { id: 1, estado: '' },
              });
            }
          } catch (e) {
            console.warn('No se pudo obtener info de usuario:', e);
          }
        }
      }
    } catch (error: any) {
      console.error("Error loading credits:", error);
      if (error.response?.status === 401) {
        router.push("/authentication/login");
      } else {
        setCredits([]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [userId, router]);

  const loadTasas = useCallback(async () => {
    if (!tasas || tasas.length === 0) {
      try {
        const response = await creditsService.getTasas();
        if (response) setTasas(response);
      } catch (error: any) {
        console.error("Error loading tasas:", error);
        if (error.response?.status === 401) {
          router.push("/authentication/login");
        }
      }
    }
  }, [tasas, router]);

  const fetchData = useCallback(async () => {
    const hasSession = authService.isAuthenticated();
    if (hasSession) {
      const user = await authService.getCurrentUserData();
      setCurrentUser(user);
      checkValidRoles();
      await loadTasas();
      await loadCredits();
      stopLoading();
    }
  }, [loadTasas, loadCredits]);

  useEffect(() => {
    setupAxiosInterceptors(router);
    fetchData();
  }, [userId, fetchData, router]);

  const checkValidRoles = () => {
    const userRoles = authService.getUserRoles();
    const isAdmin = validateRoles(roleAdmin, userRoles);
    setIsUserAdmin(isAdmin);
  };

  const stableSort = (array: Prestamo[], comparator: (a: Prestamo, b: Prestamo) => number) => {
    const stabilized = array.map((el, index) => [el, index] as [Prestamo, number]);
    stabilized.sort((a, b) => {
      const result = comparator(a[0], b[0]);
      return result !== 0 ? result : a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
  };

  const sortedTransactions = stableSort(credits, getComparator(order, orderBy));

  const handleOpenRequestModal = () => setOpenRequestModal(true);
  const handleCloseRequestModal = () => setOpenRequestModal(false);
  const handleCloseModifyModal = () => setOpenModifyModal(false);
  const handleCloseApproveModal = () => setOpenApproveModal(false);
  const handleOpenReportModal = () => setOpenReportModal(true);
  const handleCloseReportModal = () => setOpenReportModal(false);

  const handleEditClick = (row: Prestamo) => {
    setSelectedPrestamo(row);
    setOpenModifyModal(true);
  };

  const handleApproveClick = (row: Prestamo) => {
    setSelectedPrestamo(row);
    setOpenApproveModal(true);
  };

  const handleOpenDetail = (row: Prestamo) => {
    if (row) {
      const idUser = row.idAsociado.id;
      router.push(`/modules/credit/user?userId=${idUser}&creditId=${row.id}`);
    }
  };

  const handleRecalculateCuotas = async (row: Prestamo) => {
    const result = await Swal.fire({
      title: "¿Recalcular Cuotas?",
      text: `Se volverán a generar las cuotas del préstamo #${row.id} con los valores actuales (monto, plazo, tasa y protección de cartera). Esta opción solo aplica si no hay pagos registrados.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, Recalcular",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: "Recalculando cuotas del crédito",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await creditsService.recalcularCuotas(row.id);

        await Swal.fire({
          title: "¡Cuotas Recalculadas!",
          text: `Las cuotas del préstamo #${row.id} han sido recalculadas exitosamente.`,
          icon: "success",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#4caf50",
        });

        await loadCredits();
      } catch (error: any) {
        console.error("Error al recalcular cuotas:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudieron recalcular las cuotas.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  const handleFinalizarCredito = async (prestamo: any) => {
    const result = await Swal.fire({
      title: "¿Finalizar Crédito?",
      text: `Todas las cuotas de este préstamo #${prestamo.id} ya se encuentran pagadas/canceladas. ¿Desea cambiar el estado del crédito a FINALIZADO?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, Finalizar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Procesando...",
          text: "Actualizando estado del crédito",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const updated = await creditsService.update(prestamo.id, {
          ...prestamo,
          estado: "FINALIZADO",
        });

        if (updated) {
          await Swal.fire({
            title: "¡Crédito Finalizado!",
            text: `El estado del crédito #${prestamo.id} ha sido actualizado a FINALIZADO.`,
            icon: "success",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4caf50",
          });
          await loadCredits();
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudo actualizar el estado del crédito.",
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      } catch (error: any) {
        console.error("Error al finalizar crédito:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Error al actualizar el estado.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  const handleRequestSubmit = async (formData: any) => {
    if (formData.monto) {
      Swal.fire({
        title: "Procesando...",
        text: "Creando solicitud de crédito",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      formData.idAsociado = userInfo;
      const saved = await creditsService.create(formData);

      if (saved) {
        await Swal.fire({
          title: "¡Solicitud Creada!",
          text: `Su solicitud de crédito por $${formatCurrency(formData.monto)} ha sido enviada exitosamente.`,
          icon: "success",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#4caf50",
        });
        await loadCredits();
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo crear la solicitud. Intente nuevamente.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    }
    handleCloseRequestModal();
  };

  const handleModifySubmit = async (formData: any) => {
    if (selectedPrestamo) {
      const result = await Swal.fire({
        title: "¿Confirmar Cambios?",
        text: "Se actualizarán los datos del crédito seleccionado.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#f44336",
        confirmButtonText: "Sí, Actualizar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Procesando...",
          text: "Actualizando crédito",
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });

        const saved = await creditsService.update(selectedPrestamo.id, formData);

        if (saved) {
          await Swal.fire({
            title: "¡Crédito Actualizado!",
            text: "Los cambios han sido guardados exitosamente.",
            icon: "success",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4caf50",
          });
          await loadCredits();
          handleCloseModifyModal();
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudieron guardar los cambios. Intente nuevamente.",
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      }
    }
  };

  const handleApproveCredit = async (formData: any) => {
    if (formData && selectedPrestamo) {
      handleCloseApproveModal();

      const result = await Swal.fire({
        title: "¿Confirmar Aprobación?",
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>Asociado:</strong> ${selectedPrestamo.idAsociado?.nombres}</p>
            <p><strong>Monto:</strong> $${formatCurrency(selectedPrestamo.monto)}</p>
            <p><strong>Plazo:</strong> ${selectedPrestamo.plazoMeses} meses</p>
            <p><strong>Cuota Mensual:</strong> $${formatCurrency(formData.cuotaMensual || 0)}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 15px;">
            Esta acción no se puede deshacer. El crédito será aprobado inmediatamente.
          </p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#4caf50",
        cancelButtonColor: "#f44336",
        confirmButtonText: "Sí, Aprobar Crédito",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Procesando...",
          text: "Aprobando el crédito",
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); },
        });

        formData.estado = "APROBADO";
        formData.fechaCredito = formatDateTime(formData.fechaCredito);
        formData.fechaVencimiento = formatDateTime(formData.fechaVencimiento);
        formData.fechaActualizacion = formatDateTime(new Date());

        const rs = await creditsService.approveCredit(selectedPrestamo.id, formData);

        if (rs) {
          await Swal.fire({
            title: "¡Crédito Aprobado!",
            text: `El crédito de $${formatCurrency(selectedPrestamo.monto)} ha sido aprobado exitosamente.`,
            icon: "success",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#4caf50",
          });
          await loadCredits();
          setSelectedPrestamo(null);
        } else {
          Swal.fire({
            title: "Error",
            text: "No se pudo aprobar el crédito. Intente nuevamente.",
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      } else {
        setOpenApproveModal(true);
      }
    }
  };

  const handleDelete = async (prestamo: Prestamo) => {
    const paymentsCount = prestamo.presCuotas
      ? prestamo.presCuotas.reduce((sum: number, c: any) => sum + (c.presPagos ? c.presPagos.length : 0), 0)
      : 0;

    const result = await Swal.fire({
      title: "¿Eliminar crédito?",
      html: `
        <div style="text-align: left;">
          <p><strong>Asociado:</strong> ${prestamo.idAsociado?.nombres}</p>
          <p><strong>Monto:</strong> $${formatCurrency(prestamo.monto)}</p>
          <p><strong>Estado:</strong> ${prestamo.estado}</p>
          ${paymentsCount > 0 ? `<p style="color: #d32f2f;"><strong>Este crédito tiene ${paymentsCount} pago(s) registrado(s).</strong></p>` : ''}
          <p style="color: #d32f2f; margin-top: 16px;"><strong>⚠️ Esta acción eliminará:</strong></p>
          <ul style="color: #d32f2f; text-align: left;">
            <li>El registro del crédito</li>
            <li>Todas las cuotas asociadas</li>
            <li>Todos los pagos realizados</li>
            <li>El historial completo</li>
          </ul>
          <p style="color: #d32f2f; font-weight: bold;">Esta acción no se puede deshacer.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await creditsService.delete(prestamo.id);
        await Swal.fire({
          icon: "success",
          title: "Crédito eliminado",
          text: "El crédito y todos sus registros han sido eliminados exitosamente",
          timer: 2000,
          showConfirmButton: false,
        });
        await loadCredits();
      } catch (error) {
        console.error("Error al eliminar crédito:", error);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: "No se pudo eliminar el crédito. Por favor, intente nuevamente.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#d32f2f",
        });
      }
    }
  };

  const handlePrintCredit = (prestamo: Prestamo) => {
    try {
      const printWindow = window.open("", "_blank", "width=1000,height=1100");
      if (!printWindow) {
        Swal.fire({
          icon: "warning",
          title: "No se pudo abrir la impresión",
          text: "Permite las ventanas emergentes para generar el PDF.",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const cleanLogoUrl = logoBase64.replace(/^url\(["']?|["']?\)$/g, "");

      const escapeHtml = (value: unknown) => String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      const money = (value: unknown) => `$${new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0)}`;
      const date = (value: unknown) => value
        ? formatNameDate(value as any) || "-"
        : "-";

      const creditId = prestamo.id;
      const asociado = prestamo.idAsociado;
      const nombreSocio = typeof asociado === "object" && asociado !== null
        ? [asociado.apellido1, asociado.apellido2, asociado.nombre1, asociado.nombre2].filter(Boolean).join(" ") || asociado.nombres || "Socio Registrado"
        : "Socio Registrado";
      const numIdentificacion = typeof asociado === "object" && asociado !== null
        ? asociado.numeroDeIdentificacion || "Sin datos"
        : "Sin datos";

      const tasaRaw = parseFloat(String((prestamo as any).tasa || prestamo.idTasa?.tasa || "0"));
      const tasaCredito = (tasaRaw * 100).toFixed(2);
      const fechaSolicitudFmt = (prestamo as any).fechaSolicitud ? formatNameDate((prestamo as any).fechaSolicitud) : (prestamo.fechaCredito ? formatNameDate(prestamo.fechaCredito) : "Sin fecha");
      const fechaDesembolsoFmt = prestamo.fechaDesembolso ? formatNameDate(prestamo.fechaDesembolso) : (prestamo.fechaCredito ? formatNameDate(prestamo.fechaCredito) : "No desembolsado");
      const aplicaProteccion = prestamo.aplicaProteccionCartera !== false;
      const aplicaProteccionTexto = aplicaProteccion ? "Aplica (0.1%)" : "No aplica";
      const plazoMeses = prestamo.plazoMeses || 0;

      let presCuotas = (prestamo.presCuotas || []).slice().sort(
        (a: any, b: any) => Number(a.numeroCuota) - Number(b.numeroCuota)
      );

      if (presCuotas.length === 0 && prestamo.monto && prestamo.plazoMeses) {
        const monto = Number(prestamo.monto) || 0;
        const plazo = Number(prestamo.plazoMeses) || 0;
        const tasaMensual = Number(prestamo.idTasa?.tasa ?? (prestamo as any).tasa) || 0;
        const cuotaMensual = tasaMensual > 0
          ? (monto * tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1)
          : plazo > 0 ? monto / plazo : 0;
        let saldoCapital = monto;
        let saldoCapitalTmp = monto;
        let fechaInicial = new Date(prestamo.fechaCredito || prestamo.fechaDesembolso || new Date());
        if (isNaN(fechaInicial.getTime())) fechaInicial = new Date();
        const porcentajeProteccion = prestamo.porcentajeProteccionCartera ?? 0.001;

        presCuotas = Array.from({ length: plazo }, (_, index) => {
          const cuotaNum = index + 1;
          const intereses = saldoCapital * tasaMensual;
          const capital = cuotaMensual - intereses;
          const proteccion = aplicaProteccion ? saldoCapitalTmp * porcentajeProteccion : 0;
          saldoCapital -= capital;
          saldoCapitalTmp -= capital;
          const vencimiento = new Date(fechaInicial);
          vencimiento.setMonth(vencimiento.getMonth() + cuotaNum);
          return {
            id: cuotaNum,
            numeroCuota: cuotaNum,
            fechaVencimiento: vencimiento.toISOString(),
            monto: cuotaMensual,
            proteccionCartera: proteccion,
            abonoExtra: 0,
            estado: "PENDIENTE",
            abonoCapital: capital,
            intereses: intereses,
            mora: 0,
            presPagos: [],
          };
        });
      }

      const sortedCuotas = presCuotas.map((cuota: any) => {
        const extraCalculado =
          cuota.presPagos?.reduce(
            (sum: number, p: any) => sum + (Number(p.abonoExtra) || 0),
            0
          ) || Number(cuota?.abonoExtra) || 0;

        const pagoRegistrado = cuota.presPagos?.[0];
        const proteccionReal =
          pagoRegistrado && typeof pagoRegistrado.proteccionCartera === "number"
            ? pagoRegistrado.proteccionCartera
            : cuota.proteccionCartera;

        return {
          ...cuota,
          proteccionCartera: proteccionReal,
          abonoExtra: extraCalculado,
        };
      });

      const cuotasPagadas = sortedCuotas.filter(c => c.estado === "PAGADO").length;
      const cuotasPendientes = sortedCuotas.filter(c => c.estado === "PENDIENTE").length;
      const cuotasCanceladas = sortedCuotas.filter(c => c.estado === "CANCELADO").length;
      const cuotasAtrasadas = sortedCuotas.filter(c => {
        if (c.estado === "PENDIENTE") {
          const today = new Date();
          const dueDate = new Date(c.fechaVencimiento);
          return dueDate < today;
        }
        return false;
      }).length;

      const totalCuotasMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.monto) || 0), 0);
      const totalProteccionMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.proteccionCartera) || 0), 0);
      const totalExtraMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.abonoExtra) || 0), 0);
      const totalCapitalMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.abonoCapital) || 0), 0);
      const totalInteresesMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.intereses) || 0), 0);
      const totalMoraMonto = sortedCuotas.reduce((sum, c: any) => sum + (Number(c.mora) || 0), 0);

      const paymentRows = sortedCuotas.map((cuota: any) => {
        const payments = cuota.presPagos || [];
        const paymentDetails = payments.length
          ? payments.map((pago: any) => `
              <div class="pay-item">
                <div class="pay-line-top">
                  <span class="pay-date">${date(pago.diaDePago || pago.fechaPago)}</span>
                  <span class="pay-val">${money(pago.totalPagado || pago.montoPagado)}</span>
                </div>
                <div class="pay-meth">${escapeHtml(pago.metodoPago?.nombre || "EFECTIVO")}</div>
              </div>
            `).join("")
          : '<span class="text-muted center-text">-</span>';

        const extra = Number(cuota.abonoExtra) || 0;
        const prot = Number(cuota.proteccionCartera) || 0;
        const estadoClass = cuota.estado === "PAGADO" ? "badge-success" : cuota.estado === "PENDIENTE" ? "badge-warning" : "badge-secondary";

        return `<tr>
          <td class="center font-bold">#${escapeHtml(cuota.numeroCuota)}</td>
          <td class="center">${date(cuota.fechaVencimiento)}</td>
          <td class="right font-semibold">${money(cuota.monto)}</td>
          ${aplicaProteccion ? `<td class="right">${prot > 0 ? money(prot) : "-"}</td>` : ""}
          <td class="right ${extra > 0 ? "text-purple font-semibold" : "text-muted"}">${extra > 0 ? money(extra) : "-"}</td>
          <td class="center"><span class="badge ${estadoClass}">${escapeHtml(cuota.estado)}</span></td>
          <td class="right">${money(cuota.abonoCapital)}</td>
          <td class="right">${money(cuota.intereses)}</td>
          <td class="right ${Number(cuota.mora) > 0 ? "text-danger font-semibold" : ""}">${Number(cuota.mora) > 0 ? money(cuota.mora) : "-"}</td>
          <td>${paymentDetails}</td>
        </tr>`;
      }).join("");

      printWindow.document.write(`<!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Historial de Pagos - Crédito #${escapeHtml(creditId)}</title>
        <style>
          @page { size: letter portrait; margin: 8mm 10mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Roboto', 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; font-size: 9px; line-height: 1.25; background: #fff; }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-bottom: 10px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand img { width: 50px; height: 50px; object-fit: contain; }
          .brand-title { color: #0f766e; font-weight: 800; font-size: 8.5px; line-height: 1.15; }
          .brand-subtitle { color: #0f766e; font-weight: 800; font-size: 9.5px; letter-spacing: 0.3px; }
          .brand-nit { color: #64748b; font-size: 7.5px; }

          .doc-info { text-align: right; }
          .doc-info .doc-label { font-size: 7.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .doc-info .credit-num { font-size: 13px; font-weight: 900; color: #0f766e; }

          .user-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background: #f8fafc; margin-bottom: 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; }
          .user-info-item { font-size: 8px; color: #475569; }
          .user-info-item strong { color: #0f172a; font-size: 8.5px; font-weight: 700; }

          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
          .stat-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background: #f8fafc; }
          .stat-card.success { border-color: #bbf7d0; background: #f0fdf4; }
          .stat-card.warning { border-color: #fef08a; background: #fefce8; }
          .stat-card.danger { border-color: #fecdd3; background: #fef2f2; }
          .stat-label { font-size: 7.5px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.3px; }
          .stat-value { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 1px; }

          .section-title { font-size: 10px; font-weight: 800; color: #0f766e; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }

          table { border-collapse: collapse; width: 100%; table-layout: fixed; margin-bottom: 10px; font-size: 8.5px; }
          th { background: #0f766e; color: #ffffff; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 7.5px; letter-spacing: 0.3px; padding: 5px 4px; border: 1px solid #0f766e; }
          td { border: 1px solid #cbd5e1; padding: 4px 4px; vertical-align: middle; overflow-wrap: anywhere; }
          tr:nth-child(even) { background: #f8fafc; }
          
          .totals-row td { background: #f1f5f9; font-weight: 800; border-top: 2px solid #0f766e; color: #0f172a; }

          .center { text-align: center; }
          .right { text-align: right; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .text-muted { color: #94a3b8; }
          .text-purple { color: #7e22ce; }
          .text-danger { color: #dc2626; }

          .badge { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 7px; font-weight: 700; text-transform: uppercase; }
          .badge-success { background: #dcfce7; color: #15803d; }
          .badge-warning { background: #fef9c3; color: #a16207; }
          .badge-secondary { background: #f1f5f9; color: #475569; }

          .pay-item { font-size: 7.5px; line-height: 1.15; padding: 2px 0; border-bottom: 1px dashed #e2e8f0; }
          .pay-item:last-child { border-bottom: none; }
          .pay-line-top { display: flex; justify-content: space-between; align-items: center; gap: 4px; }
          .pay-date { font-weight: 600; color: #334155; font-size: 7.5px; }
          .pay-val { font-weight: 800; color: #15803d; font-size: 8px; }
          .pay-meth { color: #64748b; font-size: 6.5px; font-weight: 600; text-transform: uppercase; margin-top: 1px; }
          .center-text { display: block; text-align: center; }

          .footer { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <img src="${cleanLogoUrl}" alt="Logo Cooperativa" />
            <div>
              <div class="brand-title">COOPERATIVA MULTIACTIVA DE PRODUCCIÓN Y PRESTACIÓN DE SERVICIOS</div>
              <div class="brand-subtitle">INTEGRACIÓN SIGLO XXI</div>
              <div class="brand-nit">NIT. 08301055337</div>
            </div>
          </div>
          <div class="doc-info">
            <div class="doc-label">HISTORIAL DE PAGOS</div>
            <div class="credit-num">CRÉDITO #${escapeHtml(creditId)}</div>
            <div style="font-size: 8.5px; color: #475569;">Plazo: <strong>${escapeHtml(plazoMeses)} meses</strong></div>
          </div>
        </div>

        <div class="user-card">
          <div class="user-info-item">
            Afiliado / Socio: <strong>${escapeHtml(nombreSocio)}</strong>
          </div>
          <div class="user-info-item">
            No. Identificación: <strong>${escapeHtml(numIdentificacion)}</strong>
          </div>
          <div class="user-info-item">
            Monto Crédito: <strong>$${formatCurrency(redondearHaciaArriba(Number(prestamo.monto) || 0))}</strong>
          </div>
          <div class="user-info-item">
            Tasa Aplicada: <strong>${tasaCredito}% mensual</strong>
          </div>
          <div class="user-info-item">
            Protección Cartera: <strong>${aplicaProteccionTexto}</strong>
          </div>
          <div class="user-info-item">
            Fecha Solicitud: <strong>${fechaSolicitudFmt}</strong>
          </div>
          <div class="user-info-item">
            Fecha Desembolso: <strong>${fechaDesembolsoFmt}</strong>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card success">
            <div class="stat-label">Cuotas Pagadas</div>
            <div class="stat-value" style="color:#15803d;">${cuotasPagadas}</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Cuotas Pendientes</div>
            <div class="stat-value" style="color:#a16207;">${cuotasPendientes}</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Cuotas Atrasadas</div>
            <div class="stat-value" style="color:#dc2626;">${cuotasAtrasadas}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Cuotas Canceladas</div>
            <div class="stat-value">${cuotasCanceladas}</div>
          </div>
        </div>

        <div class="section-title">Detalle de Amortización y Pagos Registrados</div>
        
        <table>
          <thead>
            <tr>
              <th class="center" style="width: 5%;">Cuota</th>
              <th class="center" style="width: 10%;">Vencimiento</th>
              <th class="right" style="width: 10%;">Monto</th>
              ${aplicaProteccion ? `<th class="right" style="width: 9%;">Protección</th>` : ""}
              <th class="right" style="width: 10%;">Abono Extra</th>
              <th class="center" style="width: 9%;">Estado</th>
              <th class="right" style="width: 10%;">Capital</th>
              <th class="right" style="width: 10%;">Intereses</th>
              <th class="right" style="width: 8%;">Mora</th>
              <th style="width: ${aplicaProteccion ? "19%" : "28%"};">Pagos Registrados</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
            <tr class="totals-row">
              <td colspan="2" class="center">TOTALES</td>
              <td class="right">${money(totalCuotasMonto)}</td>
              ${aplicaProteccion ? `<td class="right">${money(totalProteccionMonto)}</td>` : ""}
              <td class="right">${money(totalExtraMonto)}</td>
              <td class="center">-</td>
              <td class="right">${money(totalCapitalMonto)}</td>
              <td class="right">${money(totalInteresesMonto)}</td>
              <td class="right">${money(totalMoraMonto)}</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>COOPERATIVA MULTIACTIVA INTEGRACIÓN SIGLO XXI - Sistema de Gestión de Créditos</div>
          <div>Generado el: ${escapeHtml(new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }))}</div>
        </div>
      </body>
      </html>`);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (e) {
          console.error("Error al ejecutar impresion:", e);
        }
      }, 250);
    } catch (error: any) {
      console.error("Error al imprimir crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error de impresión",
        text: "Ocurrió un error al preparar el documento de impresión.",
        confirmButtonText: "Entendido",
      });
    }
  };

  const handleExportToExcel = () => {
    try {
      const creditosAprobados = credits.filter((c) => c.estado === "APROBADO");

      if (creditosAprobados.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Sin datos",
          text: "No hay créditos aprobados para exportar",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const excelData = [];
      excelData.push(["COD", "IDENTIFICACIÓN", "NOMBRES COMPLETOS", "VALOR CRÉDITO", "PLAZO MESES", "CUOTAS PAGADAS", "MESES FALTANTES", "CUOTAS ATRASADAS", "MESES CON PAGO", "ABONO CAPITAL", "INTERESES"]);

      creditosAprobados.forEach((credit) => {
        const cuotasPagadas = credit.presCuotas?.filter((c) => c.estado === "PAGADO").length || 0;
        const mesesFaltantes = credit.plazoMeses - cuotasPagadas;
        const today = new Date();
        const cuotasAtrasadas = credit.presCuotas?.filter((c) => c.estado === "PENDIENTE" && new Date(c.fechaVencimiento) < today).length || 0;
        const mesesConPago = new Set(credit.presCuotas?.filter((c) => c.presPagos && c.presPagos.length > 0).map((c) => new Date(c.fechaVencimiento).getMonth())).size || 0;
        const abonoCapital = credit.presCuotas?.filter((c) => c.estado === "PAGADO").reduce((sum, c) => sum + (Number(c.abonoCapital) || 0), 0) || 0;
        const intereses = credit.presCuotas?.filter((c) => c.estado === "PAGADO").reduce((sum, c) => sum + (Number(c.intereses) || 0), 0) || 0;

        const asociado = credit.idAsociado;
        const apellido1 = asociado?.apellido1 || "";
        const apellido2 = asociado?.apellido2 || "";
        const nombre1 = asociado?.nombre1 || "";
        const nombre2 = asociado?.nombre2 || "";
        const nombreCompleto = [apellido1, apellido2, nombre1, nombre2].filter((n) => n).join(" ") || asociado?.nombres || "N/A";

        excelData.push([
          credit.id,
          asociado?.numeroDeIdentificacion || "N/A",
          nombreCompleto,
          Number(credit.monto),
          credit.plazoMeses,
          cuotasPagadas,
          mesesFaltantes,
          cuotasAtrasadas,
          mesesConPago,
          abonoCapital,
          intereses,
        ]);
      });

      const totalCredito = creditosAprobados.reduce((sum, c) => sum + Number(c.monto), 0);
      const totalAbonoCapital = creditosAprobados.reduce((sum, c) => {
        return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").reduce((s, cu) => s + (Number(cu.abonoCapital) || 0), 0) || 0);
      }, 0);
      const totalIntereses = creditosAprobados.reduce((sum, c) => {
        return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").reduce((s, cu) => s + (Number(cu.intereses) || 0), 0) || 0);
      }, 0);
      const totalCuotasPagadas = creditosAprobados.reduce((sum, c) => {
        return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").length || 0);
      }, 0);
      const totalCuotasAtrasadas = creditosAprobados.reduce((sum, c) => {
        const today = new Date();
        return sum + (c.presCuotas?.filter((cu) => cu.estado === "PENDIENTE" && new Date(cu.fechaVencimiento) < today).length || 0);
      }, 0);

      excelData.push(["TOTALES", "", "", totalCredito, creditosAprobados.length, totalCuotasPagadas, "", totalCuotasAtrasadas, "", totalAbonoCapital, totalIntereses]);

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 8 }, { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      ];

      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          fill: {
            fgColor: {
              rgb: C === 8 ? "4CAF50" : C === 9 ? "FF9800" : C === 10 ? "F44336" : "1976D2",
            },
          },
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      for (let R = range.s.r + 1; R < range.e.r; ++R) {
        const cuotasAtrasadasAddr = XLSX.utils.encode_col(7) + (R + 1);
        const cuotasPagadasAddr = XLSX.utils.encode_col(5) + (R + 1);
        const plazoMesesAddr = XLSX.utils.encode_col(4) + (R + 1);

        const cuotasAtrasadas = worksheet[cuotasAtrasadasAddr]?.v || 0;
        const cuotasPagadas = worksheet[cuotasPagadasAddr]?.v || 0;
        const plazoMeses = worksheet[plazoMesesAddr]?.v || 0;
        const isCompleted = cuotasPagadas === plazoMeses && plazoMeses > 0;

        const bgColor = cuotasAtrasadas > 0 ? "FFEBEE" : isCompleted ? "E8F5E9" : "FFFFFF";

        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_col(C) + (R + 1);
          if (!worksheet[address]) continue;
          worksheet[address].s = {
            fill: { fgColor: { rgb: bgColor } },
            alignment: { horizontal: C >= 3 ? "right" : "left", vertical: "center" },
          };

          if (C === 7 && cuotasAtrasadas > 0) {
            worksheet[address].s.font = { bold: true, color: { rgb: "D32F2F" } };
            worksheet[address].s.fill = { fgColor: { rgb: "FFCDD2" } };
          }
          if (C === 5 && cuotasPagadas > 0) {
            worksheet[address].s.font = { bold: true, color: { rgb: "4CAF50" } };
          }
          if (C === 6) {
            const mesesFaltantes = worksheet[address].v || 0;
            worksheet[address].s.font = { color: { rgb: mesesFaltantes > 0 ? "FF9800" : "4CAF50" } };
          }
        }
      }

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + (range.e.r + 1);
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          fill: { fgColor: { rgb: "E3F2FD" } },
          font: { bold: true, sz: 11 },
          alignment: { horizontal: C >= 3 ? "right" : "left", vertical: "center" },
          border: { top: { style: "medium", color: { rgb: "1976D2" } } },
        };
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Préstamos");

      const fecha = new Date().toISOString().split("T")[0];
      XLSX.writeFile(workbook, `reporte_prestamos_${fecha}.xlsx`, {
        bookType: "xlsx",
        cellStyles: true,
      });

      Swal.fire({
        icon: "success",
        title: "Archivo descargado",
        text: "El reporte se ha exportado exitosamente en formato Excel",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al exportar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo exportar el reporte",
        confirmButtonText: "Entendido",
      });
    }
  };

  const getPaymentStatus = (prestamo: Prestamo) => {
    if (!prestamo || prestamo.estado !== "APROBADO") {
      return { status: "normal", pendingPayments: 0, overduePayments: 0 };
    }

    if (prestamo.presCuotas && prestamo.presCuotas.length > 0) {
      const today = new Date();
      const pendingPayments = prestamo.presCuotas.filter((cuota) => cuota.estado === "PENDIENTE").length;
      const overduePayments = prestamo.presCuotas.filter((cuota) => {
        if (cuota.estado !== "PENDIENTE") return false;
        const dueDate = new Date(cuota.fechaVencimiento);
        return dueDate < today;
      }).length;

      if (overduePayments > 0) return { status: "overdue", pendingPayments, overduePayments };
      if (pendingPayments > 0) return { status: "pending", pendingPayments, overduePayments };
      return { status: "completed", pendingPayments, overduePayments };
    }

    const today = new Date();
    const vencimiento = new Date(prestamo.fechaVencimiento);
    let desembolso: Date;
    if (prestamo.fechaDesembolso) {
      desembolso = new Date(prestamo.fechaDesembolso);
    } else if (prestamo.fechaCredito) {
      desembolso = new Date(prestamo.fechaCredito);
    } else {
      desembolso = today;
    }

    const mesesTranscurridos = Math.floor((today.getTime() - desembolso.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const cuotasPendientes = Math.max(0, prestamo.plazoMeses - mesesTranscurridos);

    if (today > vencimiento) {
      return { status: "overdue", pendingPayments: cuotasPendientes, overduePayments: cuotasPendientes };
    }
    if (cuotasPendientes > 0) {
      return { status: "pending", pendingPayments: cuotasPendientes, overduePayments: 0 };
    }
    return { status: "completed", pendingPayments: 0, overduePayments: 0 };
  };

  const getRowStyle = (prestamo: Prestamo) => {
    const paymentStatus = getPaymentStatus(prestamo);
    switch (paymentStatus.status) {
      case "overdue":
        return { backgroundColor: "#fef2f2", borderLeft: "3px solid #ef4444", "&:hover": { backgroundColor: "#fee2e2" } };
      case "pending":
        return { backgroundColor: "#fffbeb", borderLeft: "3px solid #f59e0b", "&:hover": { backgroundColor: "#fef3c7" } };
      case "completed":
        return { backgroundColor: "#f0fdf4", borderLeft: "3px solid #10b981", "&:hover": { backgroundColor: "#dcfce7" } };
      default:
        return {};
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fechaCredito", headerName: "Fecha crédito", width: 150 },
    { field: "idAsociado", headerName: "Asociado", width: 150 },
    { field: "monto", headerName: "Monto", width: 150 },
    { field: "plazoMeses", headerName: "Plazo meses", width: 80 },
    { field: "tasa", headerName: "Tasa", width: 130 },
    { field: "cuotaMensual", headerName: "Cuota mensual", width: 130 },
    { field: "estado", headerName: "Estado", width: 130 },
    { field: "estadoPagos", headerName: "Estado Pagos", width: 140 },
  ];

  const filteredColumns = userId === 0 ? columns : columns.filter((column) => column.field !== "idAsociado");

  const formatRules: Record<string, (value: any, row?: any) => React.ReactNode> = {
    fechaCredito: (value) => formatDateWithoutTime(value),
    monto: (value) => "$" + formatCurrency(value),
    cuotaMensual: (value) => "$" + formatCurrency(value),
    idAsociado: (value) => value?.nombres ?? "N/A",
    tasa: (value) => (value * 100).toFixed(2) + "%",
    estado: (value) => getEstadoChip(value),
    estadoPagos: (value, row) => {
      if (!row || row.estado !== "APROBADO") {
        return (
          <Typography variant="body2" color="text.secondary">
            N/A
          </Typography>
        );
      }
      const paymentStatus = getPaymentStatus(row);
      switch (paymentStatus.status) {
        case "overdue":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#ef4444" />
              <Typography variant="body2" color="#ef4444" fontWeight={600}>
                {paymentStatus.overduePayments} vencidas
              </Typography>
            </Box>
          );
        case "pending":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#f59e0b" />
              <Typography variant="body2" color="#f59e0b" fontWeight={600}>
                {paymentStatus.pendingPayments} pendientes
              </Typography>
            </Box>
          );
        case "completed":
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box width={8} height={8} borderRadius="50%" bgcolor="#10b981" />
              <Typography variant="body2" color="#10b981" fontWeight={600}>
                Al día
              </Typography>
            </Box>
          );
        default:
          return (
            <Typography variant="body2" color="text.secondary">
              N/A
            </Typography>
          );
      }
    },
  };

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    const normalizedSearch = search.trim().toLowerCase();
    const asociado = transaction.idAsociado;
    const name = [asociado?.nombre1, asociado?.nombre2, asociado?.apellido1, asociado?.apellido2, asociado?.nombres]
      .filter(Boolean).join(" ").toLowerCase();
    const paymentStatus = getPaymentStatus(transaction).status;
    const matchesSearch = !normalizedSearch
      || name.includes(normalizedSearch)
      || asociado?.numeroDeIdentificacion?.toLowerCase().includes(normalizedSearch)
      || String(transaction.id).includes(normalizedSearch);
    const matchesStatus = statusFilter === "TODOS" || transaction.estado === statusFilter;
    const matchesPayment = paymentFilter === "TODOS"
      || (paymentFilter === "MORA" && paymentStatus === "overdue")
      || (paymentFilter === "PENDIENTE" && paymentStatus === "pending")
      || (paymentFilter === "AL_DIA" && paymentStatus === "completed");
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("TODOS");
    setPaymentFilter("TODOS");
  };

  const approvedCredits = credits.filter((credit) => credit.estado === "APROBADO").length;
  const completedCredits = credits.filter((credit) => credit.estado === "FINALIZADO").length;
  const requestedCredits = credits.filter((credit) => credit.estado === "SOLICITADO").length;
  const overdueCredits = credits.filter((credit) => getPaymentStatus(credit).status === "overdue").length;

  if (loading) {
    return <GenericLoadingSkeleton type="table" rows={6} />;
  }

  return (
    <Box>
      {/* Header para admin */}
      {userId === 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
              <IconCash size={22} color="white" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Gestión de Créditos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Administra las solicitudes y créditos aprobados del sistema
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <ModuleStatCard
                label="Solicitudes pendientes"
                value={requestedCredits}
                icon={<IconClock size={20} />}
                color="#f59e0b"
                subtitle="Requieren revisión"
                highlight={requestedCredits > 0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <ModuleStatCard
                label="Créditos aprobados"
                value={approvedCredits}
                icon={<IconCircleCheck size={20} />}
                color="#10b981"
                subtitle="En seguimiento"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <ModuleStatCard
                label="Créditos finalizados"
                value={completedCredits}
                icon={<IconCircleCheckFilled size={20} />}
                color="#3b82f6"
                subtitle="Pagados totalmente"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <ModuleStatCard
                label="Con cuotas vencidas"
                value={overdueCredits}
                icon={<IconAlertTriangle size={20} />}
                color="#ef4444"
                subtitle="Atención prioritaria"
                highlight={overdueCredits > 0}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Header para usuario específico */}
      {userId > 0 && (
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <UserCard id={userId} userInfo={userInfo} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                minHeight: { xs: 112, sm: 88 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: { xs: "center", sm: "left" },
                gap: { xs: 1.25, sm: 1.5 },
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}15 100%)`,
              }}
            >
             
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  Nueva Solicitud
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Solicita un nuevo crédito con los términos actuales
                </Typography>
              </Box>
              <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={40} />}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={handleOpenRequestModal}
                  startIcon={<IconPlus size={18} />}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: { xs: 2, sm: 2.5 }, flexShrink: 0 }}
                >
                  Solicitar crédito
                </Button>
              </Suspense>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconFilter size={18} color="#64748b" />
            <Typography variant="subtitle2" fontWeight={600}>
              Filtros de búsqueda
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              color="inherit"
              onClick={clearFilters}
              disabled={!search && statusFilter === "TODOS" && paymentFilter === "TODOS"}
            >
              Limpiar filtros
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconRefresh size={16} />}
              onClick={loadCredits}
              disabled={refreshing}
            >
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
            {userId === 0 && isUserAdmin && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<IconFileReport size={16} />}
                onClick={handleOpenReportModal}
              >
                Generar reporte
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, identificación o ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="credit-status-filter">Estado</InputLabel>
              <Select
                labelId="credit-status-filter"
                value={statusFilter}
                label="Estado"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="SOLICITADO">Solicitados</MenuItem>
                <MenuItem value="APROBADO">Aprobados</MenuItem>
                <MenuItem value="RECHAZADO">Rechazados</MenuItem>
                <MenuItem value="FINALIZADO">Finalizados</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="payment-status-filter">Pagos</InputLabel>
              <Select
                labelId="payment-status-filter"
                value={paymentFilter}
                label="Pagos"
                onChange={(event) => setPaymentFilter(event.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="MORA">Con mora</MenuItem>
                <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                <MenuItem value="AL_DIA">Al día</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 1 }} display="flex" alignItems="center" justifyContent="center">
            <Chip
              label={filteredTransactions.length}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            <IconListDetails size={18} color="white" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {userId === 0 ? "Listado de créditos" : "Historial de préstamos"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredTransactions.length} resultado{filteredTransactions.length === 1 ? "" : "s"} de {credits.length}
            </Typography>
          </Box>
        </Stack>

        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
          <StyledTable
            columns={filteredColumns}
            rows={filteredTransactions}
            withPagination={true}
            pageSizeOptions={[10, 25, 50]}
            renderCell={(column, row) => {
              return formatRules[column.field] ? formatRules[column.field](row[column.field], row) : row[column.field];
            }}
            rowSx={(row) => getRowStyle(row)}
            actions={(row: any) => (
              <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                {isUserAdmin && (
                  <Tooltip title="Editar" arrow>
                    <IconButton
                      onClick={() => handleEditClick(row)}
                      color="info"
                      size="small"
                      sx={{
                        "&:hover": { backgroundColor: "#e1f5fe", transform: "scale(1.1)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconPencilDollar size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                {isUserAdmin && row["estado"] === "SOLICITADO" && (
                  <Tooltip title="Aprobar" arrow>
                    <IconButton
                      onClick={() => handleApproveClick(row)}
                      color="success"
                      size="small"
                      sx={{
                        "&:hover": { backgroundColor: "#e8f5e9", transform: "scale(1.1)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconChecks size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                {isUserAdmin && row["estado"] !== "SOLICITADO" && (
                  <Tooltip title="Ver préstamo" arrow>
                    <IconButton
                      onClick={() => handleOpenDetail(row)}
                      color="warning"
                      size="small"
                      sx={{
                        "&:hover": { backgroundColor: "#fff3e0", transform: "scale(1.1)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconEyeDollar size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                {isUserAdmin &&
                  row["estado"] !== "SOLICITADO" &&
                  row.presCuotas &&
                  row.presCuotas.length > 0 &&
                  !row.presCuotas.some(
                    (c: any) =>
                      c.estado === "PAGADO" ||
                      (c.presPagos && c.presPagos.length > 0),
                  ) && (
                    <Tooltip title="Recalcular cuotas" arrow>
                      <IconButton
                        onClick={() => handleRecalculateCuotas(row)}
                        color="secondary"
                        size="small"
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f3e5f5",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <IconCalculator size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                {isUserAdmin &&
                  row["estado"] !== "SOLICITADO" &&
                  row["estado"] !== "FINALIZADO" &&
                  row.presCuotas &&
                  row.presCuotas.length > 0 &&
                  !row.presCuotas.some((c: any) => c.estado === "PENDIENTE") && (
                    <Tooltip title="Finalizar crédito" arrow>
                      <IconButton
                        onClick={() => handleFinalizarCredito(row)}
                        color="success"
                        size="small"
                        sx={{
                          "&:hover": {
                            backgroundColor: "#e8f5e9",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <IconCircleCheckFilled size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                <Tooltip title="Imprimir crédito" arrow>
                  <IconButton
                    onClick={() => handlePrintCredit(row)}
                    color="primary"
                    size="small"
                    sx={{ "&:hover": { backgroundColor: "#e3f2fd", transform: "scale(1.1)" }, transition: "all 0.2s ease" }}
                  >
                    <IconPrinter size={18} />
                  </IconButton>
                </Tooltip>
                {isUserAdmin && (
                  <Tooltip title="Eliminar" arrow>
                    <IconButton
                      onClick={() => handleDelete(row)}
                      color="error"
                      size="small"
                      sx={{
                        "&:hover": { backgroundColor: "#ffebee", transform: "scale(1.1)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconTrash size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          />
        </Suspense>
      </Paper>

      {/* Modal para Solicitud de Préstamo */}
      <Dialog
        open={openRequestModal}
        onClose={handleCloseRequestModal}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <IconPlus size={18} color="white" />
          </Avatar>
          <Typography component="span" variant="h6" fontWeight={600}>
            Nueva Solicitud de Crédito
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <CreditForm mode="create" tasas={tasas} onSubmit={handleRequestSubmit} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseRequestModal} color="inherit" startIcon={<IconX size={16} />}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Modificación */}
      <Dialog
        open={openModifyModal}
        onClose={handleCloseModifyModal}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
            <IconPencilDollar size={18} color="white" />
          </Avatar>
          <Typography component="span" variant="h6" fontWeight={600}>
            Editar Crédito
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <CreditForm mode="edit" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleModifySubmit} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModifyModal} color="inherit" startIcon={<IconX size={16} />}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Aprobación */}
      <Dialog
        open={openApproveModal}
        onClose={handleCloseApproveModal}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
            <IconChecks size={18} color="white" />
          </Avatar>
          <Typography component="span" variant="h6" fontWeight={600}>
            Aprobar Solicitud de Crédito
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedPrestamo && (
            <Paper
              elevation={0}
              sx={{ p: 2, mb: 3, bgcolor: "success.light", borderRadius: 2, border: "1px solid", borderColor: "success.main" }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <IconUserCircle size={18} color="#10b981" />
                <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                  Información del Crédito a Aprobar
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">Asociado</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedPrestamo.idAsociado?.nombres}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">Monto Solicitado</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary">${formatCurrency(selectedPrestamo.monto)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">Plazo</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedPrestamo.plazoMeses} meses</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
            Revise cuidadosamente los términos antes de aprobar
          </Alert>

          <CreditForm mode="approve" tasas={tasas} existingData={selectedPrestamo} onSubmit={handleApproveCredit} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseApproveModal} color="inherit" startIcon={<IconX size={16} />}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Reporte */}
      <Dialog
        open={openReportModal}
        onClose={handleCloseReportModal}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
              <IconFileReport size={18} color="white" />
            </Avatar>
            <Box>
              <Typography component="span" variant="h6" fontWeight={600}>
                Reporte de Préstamos Aprobados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total de créditos: {credits.filter((c) => c.estado === "APROBADO").length}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {credits.filter((c) => c.estado === "APROBADO").length === 0 ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay créditos aprobados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cuando se aprueben créditos, aparecerán en este reporte
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>COD</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>IDENTIFICACIÓN</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem", minWidth: 200 }}>NOMBRES COMPLETOS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>VALOR CRÉDITO</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>PLAZO MESES</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#4caf50", color: "white", fontSize: "0.75rem" }}>CUOTAS PAGADAS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#ff9800", color: "white", fontSize: "0.75rem" }}>MESES FALTANTES</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#f44336", color: "white", fontSize: "0.75rem" }}>CUOTAS ATRASADAS</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>MESES CON PAGO</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>ABONO CAPITAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "white", fontSize: "0.75rem" }}>INTERESES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {credits
                    .filter((credit) => credit.estado === "APROBADO")
                    .map((credit) => {
                      const cuotasPagadas = credit.presCuotas?.filter((c) => c.estado === "PAGADO").length || 0;
                      const mesesFaltantes = credit.plazoMeses - cuotasPagadas;
                      const today = new Date();
                      const cuotasAtrasadas = credit.presCuotas?.filter((c) => c.estado === "PENDIENTE" && new Date(c.fechaVencimiento) < today).length || 0;
                      const mesesConPago = new Set(credit.presCuotas?.filter((c) => c.presPagos && c.presPagos.length > 0).map((c) => new Date(c.fechaVencimiento).getMonth())).size || 0;
                      const abonoCapital = credit.presCuotas?.filter((c) => c.estado === "PAGADO").reduce((sum, c) => sum + (Number(c.abonoCapital) || 0), 0) || 0;
                      const intereses = credit.presCuotas?.filter((c) => c.estado === "PAGADO").reduce((sum, c) => sum + (Number(c.intereses) || 0), 0) || 0;

                      const asociado = credit.idAsociado;
                      const nombreCompleto = [asociado?.apellido1, asociado?.apellido2, asociado?.nombre1, asociado?.nombre2].filter((n) => n).join(" ") || asociado?.nombres || "N/A";

                      const rowBgColor = cuotasAtrasadas > 0 ? "#fef2f2" : cuotasPagadas === credit.plazoMeses ? "#f0fdf4" : "#fff";

                      return (
                        <TableRow key={credit.id} hover sx={{ bgcolor: rowBgColor }}>
                          <TableCell sx={{ fontWeight: 500 }}>{credit.id}</TableCell>
                          <TableCell>{asociado?.numeroDeIdentificacion || "N/A"}</TableCell>
                          <TableCell>{nombreCompleto}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>${formatCurrency(credit.monto)}</TableCell>
                          <TableCell align="center">{credit.plazoMeses}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: cuotasPagadas > 0 ? "#10b981" : "text.secondary" }}>
                            {cuotasPagadas}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, color: mesesFaltantes > 0 ? "#f59e0b" : "#10b981" }}>
                            {mesesFaltantes}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color: cuotasAtrasadas > 0 ? "#ef4444" : "#10b981",
                              bgcolor: cuotasAtrasadas > 0 ? "#fee2e2" : "transparent",
                            }}
                          >
                            {cuotasAtrasadas > 0 ? `⚠️ ${cuotasAtrasadas}` : cuotasAtrasadas}
                          </TableCell>
                          <TableCell align="center">{mesesConPago}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>${formatCurrency(abonoCapital)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>${formatCurrency(intereses)}</TableCell>
                        </TableRow>
                      );
                    })}
                  {(() => {
                    const creditosAprobados = credits.filter((c) => c.estado === "APROBADO");
                    const totalCredito = creditosAprobados.reduce((sum, c) => sum + Number(c.monto), 0);
                    const totalAbonoCapital = creditosAprobados.reduce((sum, c) => {
                      return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").reduce((s, cu) => s + (Number(cu.abonoCapital) || 0), 0) || 0);
                    }, 0);
                    const totalIntereses = creditosAprobados.reduce((sum, c) => {
                      return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").reduce((s, cu) => s + (Number(cu.intereses) || 0), 0) || 0);
                    }, 0);
                    const totalCuotasPagadas = creditosAprobados.reduce((sum, c) => {
                      return sum + (c.presCuotas?.filter((cu) => cu.estado === "PAGADO").length || 0);
                    }, 0);
                    const totalCuotasAtrasadas = creditosAprobados.reduce((sum, c) => {
                      const today = new Date();
                      return sum + (c.presCuotas?.filter((cu) => cu.estado === "PENDIENTE" && new Date(cu.fechaVencimiento) < today).length || 0);
                    }, 0);

                    return (
                      <TableRow sx={{ bgcolor: "#e3f2fd", borderTop: "2px solid #1976d2" }}>
                        <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: "0.95rem" }}>TOTALES</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>${formatCurrency(totalCredito)}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{creditosAprobados.length}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#10b981" }}>{totalCuotasPagadas}</TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: totalCuotasAtrasadas > 0 ? "#ef4444" : "#10b981" }}>
                          {totalCuotasAtrasadas > 0 ? `⚠️ ${totalCuotasAtrasadas}` : totalCuotasAtrasadas}
                        </TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>${formatCurrency(totalAbonoCapital)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>${formatCurrency(totalIntereses)}</TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box component="span" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#fef2f2", border: "1px solid #ef4444", display: "inline-block" }} /> Atrasadas
            <Box component="span" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#f0fdf4", border: "1px solid #10b981", display: "inline-block", ml: 1 }} /> Completadas
          </Typography>
          <Button onClick={handleCloseReportModal} color="inherit" startIcon={<IconX size={16} />}>
            Cerrar
          </Button>
          <Button variant="contained" color="primary" startIcon={<IconFileDownload size={16} />} onClick={handleExportToExcel}>
            Exportar a Excel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditModule;