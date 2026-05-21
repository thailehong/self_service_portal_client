import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  InputAdornment,
  Paper,
  Stack,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../common/EmptyState';
import { LoadingBlock } from '../common/LoadingBlock';

function compareValues(a, b, direction) {
  if (a === b) {
    return 0;
  }

  if (a == null) {
    return 1;
  }

  if (b == null) {
    return -1;
  }

  const left = typeof a === 'string' ? a.toLowerCase() : a;
  const right = typeof b === 'string' ? b.toLowerCase() : b;

  if (left < right) {
    return direction === 'asc' ? -1 : 1;
  }

  return direction === 'asc' ? 1 : -1;
}

function getColumnValue(column, row, accessorName) {
  const accessor = column[accessorName];
  if (typeof accessor === 'function') {
    return accessor(row);
  }

  return row[column.id];
}

function LoadingOverlay() {
  return (
    <Box sx={{ px: 3, py: 3, width: '100%' }}>
      <LoadingBlock lines={6} height={26} />
    </Box>
  );
}

function EmptyOverlay({ title, description }) {
  return (
    <Box sx={{ px: 3, py: 3, width: '100%' }}>
      <EmptyState title={title} description={description} />
    </Box>
  );
}

export function AppDataTable({
  columns,
  rows,
  loading = false,
  selectable = false,
  onSelectionChange,
  defaultRowsPerPage = 5,
  pageSizeOptions = [5, 10, 25],
  getRowId = (row) => row.id,
  emptyTitle,
  emptyDescription,
  renderToolbarActions,
  searchPlaceholder,
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortBy, setSortBy] = useState(columns.find((column) => column.sortable !== false)?.id || columns[0]?.id);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!columns.some((column) => column.id === sortBy)) {
      const fallbackColumn = columns.find((column) => column.sortable !== false) || columns[0];
      setSortBy(fallbackColumn?.id);
      setSortDirection('asc');
    }
  }, [columns, sortBy]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchableColumns = columns.filter((column) => column.searchable !== false);

    return rows
      .filter((row) => {
        if (normalizedSearch) {
          const matchesSearch = searchableColumns.some((column) => {
            const rawValue = getColumnValue(column, row, 'searchAccessor');
            return String(rawValue ?? '').toLowerCase().includes(normalizedSearch);
          });

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      })
      .sort((leftRow, rightRow) => {
        const column = columns.find((item) => item.id === sortBy);
        const leftValue = column?.sortAccessor ? column.sortAccessor(leftRow) : leftRow[sortBy];
        const rightValue = column?.sortAccessor ? column.sortAccessor(rightRow) : rightRow[sortBy];
        return compareValues(leftValue, rightValue, sortDirection);
      });
  }, [columns, rows, search, sortBy, sortDirection]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredRows.length) {
      setPage(0);
    }
  }, [filteredRows.length, page, rowsPerPage]);

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [onSelectionChange, selectedIds]);

  const rowSelectionModel = useMemo(
    () => ({
      type: 'include',
      ids: new Set(selectedIds),
    }),
    [selectedIds]
  );

  const localeText = useMemo(
    () => ({
      noRowsLabel: emptyTitle || t('states.tableEmptyTitle'),
      noResultsOverlayLabel: emptyTitle || t('states.tableEmptyTitle'),
      paginationRowsPerPage: t('table.rowsPerPage'),
      footerRowSelected: () => '',
    }),
    [emptyTitle, t]
  );

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(columnId);
    setSortDirection('asc');
  };

  const gridColumns = useMemo(
    () =>
      columns.map((column) => {
        return {
          field: column.id,
          headerName: column.label,
          width: typeof column.width === 'number' ? column.width : undefined,
          minWidth: typeof column.width === 'number' ? column.width : 140,
          flex: typeof column.width === 'number' ? undefined : 1,
          align: column.align || 'left',
          headerAlign: column.align || 'left',
          sortable: false,
          filterable: false,
          disableColumnMenu: true,
          renderHeader: () => (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {column.sortable === false ? (
                  <Typography variant="subtitle2" noWrap>
                    {column.label}
                  </Typography>
                ) : (
                  <TableSortLabel
                    active={sortBy === column.id}
                    direction={sortBy === column.id ? sortDirection : 'asc'}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleSort(column.id);
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                )}
              </Box>
            </Stack>
          ),
          renderCell: column.render ? (params) => column.render(params.row) : undefined,
          valueGetter: column.render || column.searchAccessor || column.filterAccessor || column.sortAccessor
            ? (_, row) => getColumnValue(column, row, 'searchAccessor')
            : undefined,
        };
      }),
    [columns, sortBy, sortDirection]
  );

  return (
    <Paper sx={{ overflow: 'hidden', borderRadius: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ px: 3, py: 2.5 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {selectedIds.length ? t('table.selected', { count: selectedIds.length }) : t('common.search')}
          </Typography>
          <TextField
            size="small"
            placeholder={searchPlaceholder || t('table.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          {renderToolbarActions?.()}
        </Stack>
      </Stack>

      <Box sx={{ px: 0, pb: 0 }}>
        <DataGrid
          autoHeight
          rows={filteredRows}
          columns={gridColumns}
          getRowId={getRowId}
          loading={loading}
          checkboxSelection={selectable}
          checkboxSelectionVisibleOnly
          keepNonExistentRowsSelected
          disableRowSelectionOnClick
          disableRowSelectionExcludeModel
          hideFooterSelectedRowCount
          disableColumnFilter
          disableColumnSelector
          pagination
          paginationModel={{ page, pageSize: rowsPerPage }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setRowsPerPage(model.pageSize);
          }}
          pageSizeOptions={pageSizeOptions}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(model) => {
            setSelectedIds(Array.from(model.ids));
          }}
          localeText={localeText}
          slots={{
            loadingOverlay: LoadingOverlay,
            noRowsOverlay: () => (
              <EmptyOverlay
                title={emptyTitle || t('states.tableEmptyTitle')}
                description={emptyDescription || t('states.tableEmptyDescription')}
              />
            ),
            noResultsOverlay: () => (
              <EmptyOverlay
                title={emptyTitle || t('states.tableEmptyTitle')}
                description={emptyDescription || t('states.tableEmptyDescription')}
              />
            ),
          }}
          sx={{
            border: 0,
            '--DataGrid-overlayHeight': '220px',
            '& .MuiDataGrid-columnHeaders': {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell': {
              alignItems: 'center',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      </Box>
    </Paper>
  );
}
