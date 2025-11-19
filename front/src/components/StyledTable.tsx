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
} from '@mui/material';

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
}) => {
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleRequestSort = (field: string) => {
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
    if (!orderBy) return rows;

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
  }, [rows, orderBy, order]);

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
      <TableContainer sx={{ 
        borderRadius: 1,
        overflow: 'visible',
        maxWidth: '100%',
        '&::-webkit-scrollbar': {
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#bdbdbd',
          borderRadius: '4px',
          '&:hover': {
            background: '#9e9e9e',
          }
        }
      }}>
        <Table sx={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'scroll', minWidth: '700px' }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#f5f5f5',
              '& th': {
                backgroundColor: '#f5f5f5',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#333',
                borderBottom: '2px solid #e0e0e0',
                padding: '12px 12px',
              },
            }}
          >
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#333',
                  borderBottom: '2px solid #e0e0e0',
                  padding: '12px 12px',
                  cursor: column.sortable !== false ? 'pointer' : 'default',
                  '&:hover': column.sortable !== false ? { backgroundColor: '#e8e8e8' } : {},
                  ...headerCellSx,
                }}
              >
                {column.sortable !== false ? (
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
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
                  fontSize: '0.85rem',
                  color: '#333',
                  borderBottom: '2px solid #e0e0e0',
                  padding: '12px 12px',
                  ...headerCellSx,
                }}
              >
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsToDisplay.map((row, index) => (
            <TableRow
              key={row.id || index}
              onClick={() => onRowClick?.(row)}
              sx={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                '&:hover': {
                  backgroundColor: '#f0f7ff',
                  transition: 'background-color 0.2s ease',
                  cursor: onRowClick ? 'pointer' : 'default',
                },
                borderBottom: '1px solid #e0e0e0',
                '& td': { padding: '10px 12px' },
                ...rowSx?.(row, index),
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${row.id || index}-${column.field}`}
                  sx={{
                    fontSize: '0.8rem',
                    color: '#555',
                    ...bodyCellSx,
                  }}
                >
                  {renderCell ? (
                    renderCell(column, row, index)
                  ) : (
                    <Typography sx={{ fontSize: '0.8rem' }}>
                      {row[column.field]}
                    </Typography>
                  )}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  sx={{
                    fontSize: '0.8rem',
                    color: '#555',
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
        />
      )}
      </TableContainer>
    </Box>
  );
};

export default StyledTable;
