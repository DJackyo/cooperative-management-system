import { Mouse_Memoirs } from "next/font/google"; 
import Image from "next/image";
import Link from "next/link";
import { Typography, Box } from "@mui/material";

const poppins = Mouse_Memoirs({
  weight: "400",
  subsets: ["latin"], 
});

interface LogoProps {
  showText?: boolean;
  width?: number;
  height?: number;
  padding?: string; 
}

const Logo: React.FC<LogoProps> = ({ showText = true, width = 80, height = 80 }) => {
  return (
    <Link href="/">
      <Box display="flex" alignItems="center" gap={1}>
        <Image src="/images/logos/coop-logo.png" alt="logo" width={width} height={height} priority />
        {showText && (
          <Image src="/images/logos/coop-texto.png" alt="logo" width={width+50} height={height} priority />
          // <Typography
          //   variant="h1"
          //   className={poppins.className} // Asegúrate de que esta clase esté aplicada
          //   sx={{
          //     background: "linear-gradient(to right, rgba(93, 135, 255, 0.85), rgba(73, 190, 255, 0.85))",
          //     WebkitBackgroundClip: "text",
          //     WebkitTextFillColor: "transparent",
          //     fontWeight: 400,
          //   }}
          // >
          //   Cooperativa
          // </Typography>
        )}
      </Box>
    </Link>
  );
};

export default Logo;
