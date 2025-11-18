import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Box, Typography, LinearProgress, Stack, Button, Alert } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import { authService } from "@/app/authentication/services/authService";

interface SavingsProjection {
  projected: number;
  registered: number;
  percentage: number;
}

const SavingsProjectionCard = () => {
  const [savingsData, setSavingsData] = useState<SavingsProjection>({
    projected: 0,
    registered: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadSavingsProjection = async () => {
      try {
        console.log('Calling getSavingsProjection...');
        const response = await dashboardService.getSavingsProjection();
        console.log('Savings projection response:', response);
        
        // Extraer data si viene en formato {status, data, message}
        const data = response.data || response;
        setSavingsData(data);
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

  const handleGenerateNextYear = async () => {
    setGenerating(true);
    setMessage('');
    
    try {
      const nextYear = new Date().getFullYear() + 1;
      const response = await dashboardService.generateYearProjection(nextYear);
      console.log('Generate projection response:', response);
      
      // Extraer datos de la estructura anidada
      const result = response.data || response;
      const message = result.message || response.message;
      const created = result.created || 0;
      
      setMessage(`✅ ${message}. Metas creadas: ${created}`);
    } catch (error) {
      setMessage('❌ Error al generar las proyecciones del próximo año');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardCard title="Proyección de Ahorros">
        <Typography>Cargando...</Typography>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Proyección de Ahorros">
      <Box sx={{ p: 2 }}>
        <Stack spacing={3}>
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
                : `Faltan $${((savingsData.projected || 0) - (savingsData.registered || 0)).toLocaleString('es-CO')} para la meta`
              }
            </Typography>
          </Box>
          
          {isAdmin && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={handleGenerateNextYear}
                disabled={generating}
                fullWidth
              >
                {generating ? 'Generando...' : `Generar Metas ${new Date().getFullYear() + 1}`}
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