import React from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { useState, useEffect } from "react";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role || null); // Esto asegura que si no hay rol, se establece en null
  }, []);

  const filteredMenuItems = Menuitems.filter((item) => {
    // Verificamos que userRole no sea null y si está en item.roles
    return !item.roles || (userRole && item.roles.includes(userRole));
  });
console.log(filteredMenuItems)
  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {filteredMenuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={toggleMobileSidebar}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
