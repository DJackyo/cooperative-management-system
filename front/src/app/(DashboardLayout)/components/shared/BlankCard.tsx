import { Card } from "@mui/material";
import { JSX } from "react";

type Props = {
  className?: string;
  children: React.ReactNode | React.ReactNode[];
};

const BlankCard = ({ children, className }: Props) => {
  return (
    <Card
      sx={{ p: 0, position: "relative" }}
      className={className}
      elevation={9}
      variant={undefined}
    >
      {children}
    </Card>
  );
};

export default BlankCard;
