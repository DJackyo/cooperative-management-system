import {
  IconLayoutDashboard,
  IconAdjustmentsDollar,
  IconListDetails,
  IconUserCog,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";
import {
  roleAdmin,
  rolesList,
  roleSuperAdmin,
  roleUser,
} from "../../utilities/utils";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    roles: rolesList,
  },
  {
    navlabel: true,
    subheader: "Ahorro",
  },
  {
    id: uniqueId(),
    title: "Gestión del ahorro",
    icon: IconAdjustmentsDollar,
    href: "/modules/savings?id=",
    roles: roleAdmin,
  },
  {
    id: uniqueId(),
    title: "Mis Movimientos",
    icon: IconListDetails,
    href: "/modules/savings?id=",
    roles: [rolesList[0]],
  },
  {
    navlabel: true,
    subheader: "Crédito",
  },
  {
    id: uniqueId(),
    title: "Gestión del crédito",
    icon: IconAdjustmentsDollar,
    href: "/modules/credit?userId=0",
    roles: roleAdmin,
  },
  {
    id: uniqueId(),
    title: "Mis Movimientos",
    icon: IconListDetails,
    href: "/modules/credit?userId=",
    roles: roleUser,
  },
  {
    navlabel: true,
    subheader: "Administración",
    roles: roleSuperAdmin,
  },
  {
    id: uniqueId(),
    title: "Gestión de usuarios",
    icon: IconUserCog,
    href: "/modules/users",
    roles: roleSuperAdmin,
  },
  // {
  //   id: uniqueId(),
  //   title: "Icons",
  //   icon: IconMoodHappy,
  //   href: "/icons",
  //   roles: roleSuperAdmin,
  // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Page",
  //   icon: IconAperture,
  //   href: "/sample-page",
  //   roles: roleSuperAdmin,
  // },
];

export default Menuitems;
