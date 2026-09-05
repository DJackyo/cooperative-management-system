import { useMediaQuery, Box, Drawer } from "@mui/material";
import SidebarItems from "./SidebarItems";
import Logo from "../shared/logo/Logo";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  const sidebarWidth = isSidebarOpen ? "260px" : "72px";

  // Custom CSS for short scrollbar
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px",
    },
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: { xs: 0, lg: sidebarWidth },
          flexShrink: 0,
          transition: (theme) => theme.transitions.create("width"),
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              width: sidebarWidth,
              border: "none",
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: "4px 0 18px rgba(30, 55, 90, 0.035)",
              backgroundColor: "#ffffff",
              transition: (theme) => theme.transitions.create("width"),
              overflowX: "hidden",
              ...scrollbarStyles,
            },
          }}
        >
          {/* Sidebar Box */}
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
              <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
                sx={{ p: 1.5, borderBottom: 1, borderColor: "divider", minHeight: 82 }}
            >
              <Logo width={isSidebarOpen ? 110 : 42} height={55} padding="10px" />
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <SidebarItems collapsed={!isSidebarOpen} />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      <Box
        sx={{
          pt: 1,
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #e5eaef",
          mb: 1,
        }}
      >
        <Logo width={110} height={55} padding="10px" />
      </Box>
      <Box px={2}>
        <SidebarItems />
      </Box>
    </Drawer>
  );
};

export default MSidebar;
