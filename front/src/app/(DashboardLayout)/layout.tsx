"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import Sidebar from "@/app/(DashboardLayout)/layout/sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { setupAxiosInterceptors } from "@/services/axiosClient";
import { authService } from "@/app/authentication/services/authService";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  background: "#f3f6fa",
}));

const SidebarWrapper = styled("div")(() => ({
  position: "relative",
  zIndex: 1000,
  flexShrink: 0,
  willChange: "auto",
  "@media (max-width: 1199px)": {
    minWidth: 0,
  },
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "32px",
  flexDirection: "column",
  zIndex: 1,
  opacity: 1,
  minWidth: 0,
  background:
    "radial-gradient(circle at 100% 0%, rgba(93, 135, 255, 0.08), transparent 26rem), #f3f6fa",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/authentication/login");
      return;
    }

    setIsCheckingAuth(false);
    setupAxiosInterceptors(router);
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <MainWrapper className="mainwrapper">
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <SidebarWrapper>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onSidebarClose={() => setMobileSidebarOpen(false)}
        />
      </SidebarWrapper>

      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper className="page-wrapper">
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen((open) => !open)}
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <Container
          sx={{
            width: "100%",
            bgcolor: "transparent",
            paddingTop: { xs: "16px", sm: "24px" },
            paddingBottom: { xs: "16px", sm: "32px" },
            maxWidth: "1440px",
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Page Route */}
          {/* ------------------------------------------- */}
          <Box sx={{ minHeight: "calc(100vh - 150px)" }}>{children}</Box>
          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
