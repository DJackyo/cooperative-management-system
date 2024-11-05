import {
  IconLayoutDashboard,
  IconMoodHappy,
  IconAperture,
  IconChecklist,
  IconCreditCard,
  IconAdjustmentsDollar,
  IconListDetails,
  IconUserCog,
} from "@tabler/icons-react";
import { uniqueId } from "lodash";

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
    roles: ["socio", "administrador", "gestorOperaciones"],
  },
  {
    navlabel: true,
    subheader: "Ahorro",
  },
  {
    id: uniqueId(),
    title: "Gestión del ahorro",
    icon: IconAdjustmentsDollar,
    href: "/modules/savings",
    roles: ["administrador", "gestorOperaciones"],
  },
  {
    id: uniqueId(),
    title: "Movimientos",
    icon: IconListDetails,
    href: "/modules/savings",
    roles: ["socio"],
  },
  {
    navlabel: true,
    subheader: "Crédito",
  },
  {
    id: uniqueId(),
    title: "Gestión del crédito",
    icon: IconAdjustmentsDollar,
    href: "/modules/credit",
    roles: ["administrador", "gestorOperaciones"],
  },
  {
    id: uniqueId(),
    title: "Movimientos",
    icon: IconListDetails,
    href: "/modules/credit",
    roles: ["socio"],
  },
  {
    navlabel: true,
    subheader: "Administración",
    roles: ["administrador"],
  },
  {
    id: uniqueId(),
    title: "Gestión de usuarios",
    icon: IconUserCog,
    href: "/modules/users",
    roles: ["administrador"],
  },
  // {
  //   id: uniqueId(),
  //   title: "Icons",
  //   icon: IconMoodHappy,
  //   href: "/icons",
  //   roles: ["administrador"],
  // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Page",
  //   icon: IconAperture,
  //   href: "/sample-page",
  //   roles: ["administrador"],
  // },
];

export default Menuitems;
