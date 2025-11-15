"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "./global.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head> 
      </head>
      <body>
        <ThemeProvider theme={baselightTheme}>
          <NotificationProvider>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
