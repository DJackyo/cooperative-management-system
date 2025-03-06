import React from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { useState, useEffect } from "react";
import { authService } from "@/app/authentication/services/authService";
import { LoggedUser } from "@/interfaces/User";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const [userRole, setUserRole] = useState<[]>([]);
  const [userId, setUserId] = useState<number>();

  useEffect(() => {
    const userRole = authService.getUserRoles();
    const userData = authService.getCurrentUserData();
    setUserId(userData.userId);
    setUserRole(userRole);
  }, []);

  const updatedMenuItems = Menuitems.map((item) => {
    if (item.href) {
      let newHref = item.href;

      // Solo reemplazamos "id=" si no tiene un valor numérico ya definido
      if (newHref.includes("id=") && !newHref.match(/id=\d+/)) {
        newHref = newHref.replace("id=", `id=${userId}`);
      }
      if (newHref.includes("userId=") && !newHref.match(/userId=\d+/)) {
        newHref = newHref.replace("userId=", `userId=${userId}`);
      }

      return { ...item, href: newHref };
    }
    return item;
  });
  const filteredMenuItems = updatedMenuItems.filter((item) => {
    if (!item.roles) return true;
    return Array.isArray(userRole)
      ? userRole.some((role) => item.roles.includes(role))
      : item.roles.includes(userRole);
  });
  // console.log(filteredMenuItems)
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
