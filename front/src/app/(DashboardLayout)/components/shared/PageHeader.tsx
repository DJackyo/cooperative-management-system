import React from "react";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
}

// Encabezado de página reutilizable con degradado y breadcrumb
const PageHeader = ({
  title,
  subtitle,
  icon,
  gradient,
}: PageHeaderProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Box
      sx={{
        background: gradient || "primary.main",
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        mb: 3,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        boxShadow: 2,
      }}
    >
      <Box>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 0.5,
            "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.7)" },
          }}
        >
          <Link
            href="/"
            underline="hover"
            sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}
          >
            Inicio
          </Link>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            return isLast ? (
              <Typography
                key={segment}
                sx={{ color: "inherit", fontWeight: 600, textTransform: "capitalize" }}
              >
                {segment.replace(/-/g, " ")}
              </Typography>
            ) : (
              <Link
                key={segment}
                underline="hover"
                href={`/${segments.slice(0, index + 1).join("/")}`}
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                {segment.replace(/-/g, " ")}
              </Link>
            );
          })}
        </Breadcrumbs>
        <Box display="flex" alignItems="center" gap={1.5}>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 2,
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;