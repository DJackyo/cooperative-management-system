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
    subheader: "Usuarios",
  },
  {
    id: uniqueId(),
    title: "Gestión de usuarios",
    icon: IconUserCog,
    href: "/modules/users",
    roles: ["administrador"],
  },
  {
    navlabel: true,
    subheader: "Ahorro",
  },
  {
    id: uniqueId(),
    title: "Gestión del ahorro",
    icon: IconAdjustmentsDollar,
    href: "/utilities/typography",
    roles: ["administrador", "gestorOperaciones"],
  },
  {
    id: uniqueId(),
    title: "Movimientos",
    icon: IconListDetails,
    href: "/modules/savings",
    roles: ["socio", "administrador"],
  },
  {
    navlabel: true,
    subheader: "Crédito",
  },
  {
    id: uniqueId(),
    title: "Gestión del crédito",
    icon: IconAdjustmentsDollar,
    href: "/utilities/typography",
    roles: ["administrador", "gestorOperaciones"],
  },
  {
    id: uniqueId(),
    title: "Movimientos",
    icon: IconListDetails,
    href: "/modules/credit",
    roles: ["socio", "administrador"],
  },
  {
    navlabel: true,
    subheader: "Administración",
    roles: ["administrador"],
  },
  {
    id: uniqueId(),
    title: "Icons",
    icon: IconMoodHappy,
    href: "/icons",
    roles: ["administrador"],
  },
  {
    id: uniqueId(),
    title: "Sample Page",
    icon: IconAperture,
    href: "/sample-page",
    roles: ["administrador"],
  },
];

export default Menuitems;
