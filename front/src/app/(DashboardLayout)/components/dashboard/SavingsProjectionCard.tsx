import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Box, Typography, LinearProgress, Stack, Button, Alert, Skeleton, SxProps, Theme } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import { authService } from "@/app/authentication/services/authService";

interface SavingsProjection {
  projected: number;
  registered: number;
  percentage: number;
  /** Año efectivo usado por el backend para la proyección. */
  year?: number | null;
}

const SavingsProjectionCard = ({
  sx,
  fullHeight,
  year,
}: {
  sx?: SxProps<Theme>;
  fullHeight?: boolean;
  /** Año de la proyección. `null`/`undefined` = año en curso por defecto. */
  year?: number | null;
}) => {
  const [savingsData, setSavingsData] = useState<SavingsProjection>({
    projected: 0,
    registered: 0,
    percentage: 0,
    year: null,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const hasProjection = savingsData.projected > 0;

  useEffect(() => {
    // Al cambiar el período se recarga la proyección: se muestra el skeleton y
    // se limpia el mensaje para no generar metas con datos del año anterior.
    setLoading(true);
    setMessage('');

    const loadSavingsProjection = async () => {
      try {
        console.log('Calling getSavingsProjection...');
        const response = await dashboardService.getSavingsProjection(year);
        console.log('Savings projection response:', response);
        
        // La función ya devuelve el objeto con los campos esperados
        setSavingsData(response);
      } catch (error) {
        console.error('Error loading savings projection:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Verificar si es admin
    const userRole = authService.getUserRoles();
    console.log('User role:', userRole);
    setIsAdmin(userRole.includes('ADMINISTRADOR'));
    
    loadSavingsProjection();
  }, [year]);

  // Año objetivo para mostrar y generar metas: manda el selector de período.
  // Solo en "Todos los años" (year = null) se usa el año de la proyección
  // (el backend responde con el año en curso) o, en su defecto, el año actual.
  const targetYear = year ?? savingsData.year ?? new Date().getFullYear();

  const handleGenerateCurrentYearMetas = async () => {
    setGenerating(true);
    setMessage('');

    try {
      // Envía el año seleccionado en el dashboard para generar sus metas
      const response = await dashboardService.generateCurrentYearMetas(targetYear);
      setMessage(`✅ ${response.message}`);

      // Refrescar la proyección con las metas recién generadas
      const refreshed = await dashboardService.getSavingsProjection(targetYear);
      setSavingsData(refreshed);
    } catch (error) {
      setMessage(`❌ Error al generar/modificar las metas del año ${targetYear}`);
    } finally {
      setGenerating(false);
    }
  };


  if (loading) {
    return (
      <DashboardCard title="Proyección de Ahorros" sx={sx}>
        <Box display="flex" flexDirection="column" gap={2.5} py={1}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rounded" width="100%" height={8} />
        </Box>
      </DashboardCard>
    );
  }

  // La proyección siempre es anual: usa el año del selector o, en
  // "Todos los años", el año en curso (ver targetYear arriba).
  const projectionTitle = `Proyección de Ahorros · ${targetYear}`;
  const projectionSubtitle =
    year === null
      ? "Vista histórica: la proyección es anual, se muestra el año en curso"
      : `Metas vs. aportes registrados en ${year}`;

  return (
    <DashboardCard
      title={projectionTitle}
      subtitle={projectionSubtitle}
      sx={sx}
      fullHeight={fullHeight}
    >
      <Box sx={{ p: 2 }} pr={0.5}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Proyectado
            </Typography>
            <Typography variant="h6" fontWeight="600">
              ${(savingsData.projected || 0).toLocaleString('es-CO')}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Registrado
            </Typography>
            <Typography variant="h6" fontWeight="600" color="primary">
              ${(savingsData.registered || 0).toLocaleString('es-CO')}
            </Typography>
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progreso
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {(savingsData.percentage || 0).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(savingsData.percentage || 0, 100)} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: savingsData.percentage >= 100 ? '#4caf50' : '#2196f3'
                }
              }} 
            />
          </Box>
          
          <Box sx={{ 
            p: 2, 
            backgroundColor: (savingsData.percentage || 0) >= 100 ? '#e8f5e8' : '#f3f4f6', 
            borderRadius: 2 
          }}>
            <Typography variant="body2" color="text.secondary">
              {(savingsData.percentage || 0) >= 100
                ? `¡Meta superada! +$${((savingsData.registered || 0) - (savingsData.projected || 0)).toLocaleString('es-CO')}`
                : hasProjection
                ? `Faltan $${Math.max((savingsData.projected || 0) - (savingsData.registered || 0), 0).toLocaleString('es-CO')} para la meta`
                : 'Aún no hay metas de ahorro configuradas para este año'}
            </Typography>
          </Box>
          
          {isAdmin && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={handleGenerateCurrentYearMetas}
                disabled={generating}
                fullWidth
              >
                {generating ? 'Generando...' : `Generar Metas ${targetYear}`}
              </Button>

              
              {message && (
                <Alert 
                  severity={message.includes('✅') ? 'success' : 'error'} 
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                >
                  {message}
                </Alert>
              )}
            </Box>
          )}
        </Stack>
      </Box>
    </DashboardCard>
  );
};

export default SavingsProjectionCard;
