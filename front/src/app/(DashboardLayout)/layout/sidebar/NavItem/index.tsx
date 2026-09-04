import React from "react";
// mui imports
import {
  ListItemIcon,
  ListItem,
  List,
  styled,
  ListItemText,
  useTheme,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
  collapsed?: boolean;
}

const NavItem = ({ item, level, pathDirect, onClick, collapsed = false }: ItemType) => {
  const Icon = item.icon;
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [itemPath, itemQuery = ""] = typeof item.href === "string"
    ? item.href.split("?")
    : [item.href, ""];
  const currentQuery = searchParams.toString();
  const isSelected = pathDirect === itemPath &&
    (!itemQuery || itemQuery === currentQuery);
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    ".MuiButtonBase-root": {
      whiteSpace: "nowrap",
      marginBottom: "2px",
      padding: "8px 10px",
      borderRadius: "8px",
      backgroundColor: level > 1 ? "transparent !important" : "inherit",
      color: theme.palette.text.secondary,
      paddingLeft: "10px",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },
      "&.Mui-selected": {
        color: "white",
        backgroundColor: theme.palette.primary.main,
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: "white",
        },
      },
    },
  }));

  return (
    <List component="div" disablePadding key={item.id}>
      <ListItemStyled>
        <Tooltip title={collapsed ? item.title : ""} placement="right">
          <ListItemButton
          component={Link}
          href={item.href}
          disabled={item.disabled}
            selected={isSelected}
          target={item.external ? "_blank" : ""}
          onClick={onClick}
          aria-label={item.title}
          sx={{
            justifyContent: collapsed ? "center" : "initial",
            minWidth: 0,
            px: collapsed ? 1 : 1.25,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 0 : "36px",
              p: collapsed ? 0 : "3px 0",
              color: "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>
          {!collapsed && <ListItemText>{item.title}</ListItemText>}
          </ListItemButton>
        </Tooltip>
      </ListItemStyled>
    </List>
  );
};

export default NavItem;
