import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  TableSortLabel,
  TablePagination,
  Button,
} from '@mui/material';
import { IconSearchOff, IconRefresh } from '@tabler/icons-react';
import TableExportButton from './TableExportButton';

interface StyledTableProps {
  columns: Array<{ field: string; headerName: string; width?: number | string; sortable?: boolean }>;
  rows: any[];
  renderCell?: (column: any, row: any, index: number) => React.ReactNode;
  rowSx?: (row: any, index: number) => any;
  onRowClick?: (row: any) => void;
  headerCellSx?: any;
  bodyCellSx?: any;
  actions?: ((row: any, index: number) => React.ReactNode) | React.ReactNode;
  withPagination?: boolean; // Habilitar paginación interna
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onResetFilters?: () => void;
  exportRows?: any[];
  exportFilename?: string;
  exportSheetName?: string;
  // Ordenamiento controlado por el componente padre (opcional)
  sortField?: string | null;
  sortDirection?: SortOrder;
  onRequestSort?: (field: string) => void;
}

type SortOrder = 'asc' | 'desc';

const StyledTable: React.FC<StyledTableProps> = ({
  columns,
  rows,
  renderCell,
  rowSx,
  onRowClick,
  headerCellSx,
  bodyCellSx,
  actions,
  withPagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  emptyTitle,
  emptyMessage = 'No hay registros para mostrar con los criterios actuales.',
  emptyIcon,
  onResetFilters,
  exportRows,
  exportFilename = 'tabla',
  exportSheetName = 'Datos',
  sortField = null,
  sortDirection = 'asc',
  onRequestSort,
}) => {
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Cuando el padre controla el orden, la tabla no ordena internamente
  const isSortControlled = !!onRequestSort;
  const activeSortField = isSortControlled ? sortField : orderBy;
  const activeSortDirection = isSortControlled ? sortDirection : order;

  const handleRequestSort = (field: string) => {
    if (onRequestSort) {
      onRequestSort(field);
      return;
    }
    const isAsc = orderBy === field && order === 'asc';
    const newOrder: SortOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(field);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para obtener valor de un campo, soportando notación de punto (nested)
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  const sortedAllRows = React.useMemo(() => {
    // Si el orden es controlado por el padre, las filas ya vienen ordenadas
    if (isSortControlled || !orderBy) return rows;

    const sorted = [...rows].sort((a, b) => {
      const aValue = getNestedValue(a, orderBy);
      const bValue = getNestedValue(b, orderBy);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? 1 : -1;
      if (bValue == null) return order === 'asc' ? -1 : 1;

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return order === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Fallback for other types
      return 0;
    });

    return sorted;
  }, [rows, orderBy, order, isSortControlled]);

  // Aplicar paginación si está habilitada
  const rowsToDisplay = React.useMemo(() => {
    if (!withPagination) {
      return sortedAllRows;
    }
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedAllRows.slice(start, end);
  }, [sortedAllRows, page, pageSize, withPagination]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {sortedAllRows.length > 0 ? (
            <>
              Total: <strong>{sortedAllRows.length}</strong> {sortedAllRows.length === 1 ? 'registro' : 'registros'}
              {withPagination && sortedAllRows.length > pageSize && ` · Mostrando ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sortedAllRows.length)}`}
            </>
          ) : null}
        </Typography>
        <TableExportButton
          columns={columns}
          rows={exportRows ?? rows}
          filename={exportFilename}
          sheetName={exportSheetName}
        />
      </Box>
      <TableContainer sx={{
        borderRadius: 2,
        border: '1px solid #e5eaef',
        overflowX: 'auto',
        overflowY: 'hidden',
        maxWidth: '100%',
        bgcolor: '#ffffff',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            background: '#94a3b8',
          }
        }
      }}>
        <Table sx={{ borderCollapse: 'collapse', width: '100%', minWidth: 700 }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#f8fafc',
              '& th': {
                backgroundColor: '#f8fafc',
                fontWeight: 700,
                fontSize: '0.825rem',
                color: '#334155',
                borderBottom: '1px solid #e2e8f0',
                padding: '12px 14px',
                letterSpacing: '0.01em',
              },
            }}
          >
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sx={{
                  width: column.width,
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  color: '#334155',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  cursor: column.sortable !== false ? 'pointer' : 'default',
                  '&:hover': column.sortable !== false ? { backgroundColor: '#f1f5f9' } : {},
                  ...headerCellSx,
                }}
              >
                {column.sortable !== false ? (
                  <TableSortLabel
                    active={activeSortField === column.field}
                    direction={activeSortField === column.field ? activeSortDirection : 'asc'}
                    onClick={() => handleRequestSort(column.field)}
                  >
                    {column.headerName}
                  </TableSortLabel>
                ) : (
                  column.headerName
                )}
              </TableCell>
            ))}
            {actions && (
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  color: '#334155',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  ...headerCellSx,
                }}
              >
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsToDisplay.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} sx={{ p: 0, border: 'none' }}>
                <Box
                  sx={{
                    py: 6,
                    px: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      bgcolor: 'rgba(93, 135, 255, 0.08)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      boxShadow: '0 2px 8px rgba(93, 135, 255, 0.1)',
                    }}
                  >
                    {emptyIcon || <IconSearchOff size={28} stroke={1.5} />}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {emptyTitle || 'No se encontraron registros'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 440, mt: 0.5, mb: onResetFilters ? 2 : 0, lineHeight: 1.5 }}
                  >
                    {emptyMessage}
                  </Typography>
                  {onResetFilters && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<IconRefresh size={16} />}
                      onClick={onResetFilters}
                      sx={{ mt: 1.5, borderRadius: 2 }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : rowsToDisplay.map((row, index) => (
            <TableRow
              key={row.id || index}
              onClick={() => onRowClick?.(row)}
              sx={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fbfcff',
                '&:hover': {
                  backgroundColor: '#f1f6ff !important',
                  transition: 'background-color 0.15s ease',
                  cursor: onRowClick ? 'pointer' : 'default',
                },
                borderBottom: '1px solid #edf2f7',
                '& td': { padding: '11px 14px' },
                ...rowSx?.(row, index),
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${row.id || index}-${column.field}`}
                  sx={{
                    fontSize: '0.825rem',
                    color: '#475569',
                    ...bodyCellSx,
                  }}
                >
                  {renderCell ? (
                    renderCell(column, row, index)
                  ) : (
                    <Typography sx={{ fontSize: '0.825rem' }}>
                      {row[column.field]}
                    </Typography>
                  )}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  sx={{
                    fontSize: '0.825rem',
                    color: '#475569',
                    ...bodyCellSx,
                  }}
                >
                  {typeof actions === 'function' ? actions(row, index) : actions}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {withPagination && (
        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={sortedAllRows.length}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handlePageSizeChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            borderTop: '1px solid #edf2f7',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.8rem',
              color: '#64748b',
            },
          }}
        />
      )}
      </TableContainer>
    </Box>
  );
};

export default StyledTable;
