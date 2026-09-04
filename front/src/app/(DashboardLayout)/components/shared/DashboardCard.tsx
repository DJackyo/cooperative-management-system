import React from "react";
import { Card, CardContent, Typography, Stack, Box, SxProps, Theme } from "@mui/material";

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  cardheading?: string | React.ReactNode;
  headtitle?: string | React.ReactNode;
  headsubtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  middlecontent?: string | React.ReactNode;
  /** Permite alinear la tarjeta al 100% del alto de su contenedor (Grid). */
  fullHeight?: boolean;
  /** Estilos adicionales que se aplican al Card raíz. */
  sx?: SxProps<Theme>;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
  fullHeight = false,
  sx,
}: Props) => {
  const cardSx: SxProps<Theme> = {
    padding: 0,
    ...(fullHeight && {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }),
    ...sx,
  };
  const contentSx: SxProps<Theme> = fullHeight
    ? { p: { xs: 2, sm: 3 }, flexGrow: 1, display: "flex", flexDirection: "column" }
    : { p: { xs: 2, sm: 3 } };

  return (
    <Card sx={cardSx} elevation={0} variant="outlined">
      {cardheading ? (
        <CardContent sx={fullHeight ? { flexGrow: 1 } : undefined}>
          <Typography variant="h5">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={contentSx}>
          {title ? (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                {title ? <Typography variant="h5">{title}</Typography> : ""}

                {subtitle ? (
                  <Typography variant="subtitle2" color="textSecondary">
                    {subtitle}
                  </Typography>
                ) : (
                  ""
                )}
              </Box>
              {action}
            </Stack>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
