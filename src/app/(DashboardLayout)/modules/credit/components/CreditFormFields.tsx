// src/modules/credit/components/CreditFormFields.tsx
import { TextField, Box } from '@mui/material';

interface CreditFormFieldsProps {
  amount: string;
  term: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CreditFormFields = ({ amount, term, onChange }: CreditFormFieldsProps) => (
  <Box>
    <TextField label="Monto solicitado" value={amount} onChange={onChange} fullWidth />
    <TextField label="Plazo (meses)" value={term} onChange={onChange} fullWidth />
  </Box>
);

export default CreditFormFields;
