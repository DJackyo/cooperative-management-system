import Image from "next/image";
import Link from "next/link";
import { Typography, Box } from "@mui/material";

interface LogoProps {
  showText?: boolean;
  width?: number;
  height?: number;
  padding?: string;
}

const Logo: React.FC<LogoProps> = ({
  showText = true,
  width = 80,
  height = 80,
}) => {
  return (
    <Link href="/">
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          marginTop: 1,
        }}
      >
        <Image
          src="/images/logos/coop-logo.png"
          alt="logo"
          width={width}
          height={height}
          priority
        />
        {showText && (
          <Typography
            variant="h1"
            className={"logo-text"}
            sx={{
              background:
                "linear-gradient(to right, rgba(93, 135, 255, 0.85), rgba(73, 190, 255, 0.85))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 400,
              fontfamily: "'Mouse Memoirs', sans-serif",
            }}
          >
            COOPINSI
          </Typography>
        )}
      </Box>
    </Link>
  );
};

export default Logo;
