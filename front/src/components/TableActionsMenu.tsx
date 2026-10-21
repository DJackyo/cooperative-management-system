"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";

export interface TableAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
  danger?: boolean;
  dividerBefore?: boolean;
  section?: string;
  badge?: ReactNode;
}

interface TableActionsMenuProps {
  label: string;
  items: TableAction[];
  dataTour?: string;
  triggerTour?: string;
}

export default function TableActionsMenu({
  label,
  items,
  dataTour,
  triggerTour,
}: TableActionsMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const visibleItems = items.filter((item) => !item.hidden);
  const open = Boolean(anchor) && visibleItems.length > 0;

  return (
    <Box data-tour={dataTour} sx={{ display: "flex", justifyContent: "center", minWidth: 88 }}>
      <Tooltip title={visibleItems.length ? "Abrir acciones del registro" : "Sin acciones disponibles"}>
        <span>
          <IconButton
            id={`${id}-button`}
            data-tour={triggerTour}
            aria-label={`Más acciones para ${label}`}
            aria-haspopup="menu"
            aria-controls={open ? `${id}-menu` : undefined}
            aria-expanded={open ? true : undefined}
            disabled={!visibleItems.length}
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              setAnchor(event.currentTarget);
            }}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              backgroundColor: "#f8fbff",
              "&:hover": { backgroundColor: "#eaf2ff" },
            }}
          >
            <IconDotsVertical size={20} />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        onClick={(event) => event.stopPropagation()}
        slotProps={{
          list: { id: `${id}-menu`, "aria-labelledby": `${id}-button` },
          paper: { sx: { minWidth: 250, maxWidth: "calc(100vw - 32px)", borderRadius: 2, mt: 1 } },
        }}
      >
        <ListSubheader disableSticky sx={{ py: 1, lineHeight: "normal", maxWidth: 360 }}>
          <Typography variant="caption" color="text.secondary">
            Acciones para
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
            {label}
          </Typography>
        </ListSubheader>
        <Divider />
        {visibleItems.flatMap((item, index) => {
          const startsSection =
            Boolean(item.section) && item.section !== visibleItems[index - 1]?.section;
          return [
            ...(index > 0 && (item.dividerBefore || startsSection)
              ? [<Divider key={`${item.id}-divider`} />]
              : []),
            ...(startsSection
              ? [
                  <ListSubheader key={`${item.id}-section`} disableSticky sx={{ lineHeight: 2.5 }}>
                    {item.section}
                  </ListSubheader>,
                ]
              : []),
            <MenuItem
              key={item.id}
              disabled={item.disabled}
              sx={{ color: item.danger ? "error.main" : undefined, gap: 1, whiteSpace: "normal" }}
              onClick={() => {
                setAnchor(null);
                item.onClick();
              }}
            >
              <ListItemIcon sx={{ color: "inherit", "& svg": { width: 20, height: 20 } }}>
                {item.icon}
              </ListItemIcon>
              {item.label}
              {item.badge && <Box sx={{ ml: "auto" }}>{item.badge}</Box>}
            </MenuItem>,
          ];
        })}
      </Menu>
    </Box>
  );
}
