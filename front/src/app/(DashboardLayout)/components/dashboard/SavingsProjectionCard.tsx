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
}

const SavingsProjectionCard = ({
  sx,
  fullHeight,
}: {
  sx?: SxProps<Theme>;
  fullHeight?: boolean;
}) => {
  const [savingsData, setSavingsData] = useState<SavingsProjection>({
    projected: 0,
    registered: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const hasProjection = savingsData.projected > 0;

  useEffect(() => {
    const loadSavingsProjection = async () => {
      try {
        console.log('Calling getSavingsProjection...');
        const response = await dashboardService.getSavingsProjection();
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
  }, []);

  const handleGenerateCurrentYearMetas = async () => {
    setGenerating(true);
    setMessage('');

    try {
      const response = await dashboardService.generateCurrentYearMetas();
      const messageText = response.message;
      const created = response.created || 0;
      const updated = response.updated || 0;

      setMessage(
        `✅ ${messageText}. Metas creadas: ${created}. Metas actualizadas: ${updated}`,
      );
    } catch (error) {
      setMessage('❌ Error al generar/modificar las metas del presente año');
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

  return (
    <DashboardCard title="Proyección de Ahorros" sx={sx} fullHeight={fullHeight}>
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
                {generating ? 'Generando...' : `Generar Metas ${new Date().getFullYear()}`}
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
