import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  totalItems,
  onPageChange,
  sorting,
  onSortingChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting: sorting || [],
    },
    onSortingChange: onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-900/40 backdrop-blur-xl hover:bg-slate-800/40"
              >
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-blue-400 font-semibold text-xs uppercase tracking-wider',
                        isSortable && 'cursor-pointer select-none'
                      )}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        {isSortable && (
                          <span className="inline-flex">
                            {sortDirection === 'asc' && (
                              <ArrowUp className="h-3 w-3 text-blue-400" />
                            )}
                            {sortDirection === 'desc' && (
                              <ArrowDown className="h-3 w-3 text-blue-400" />
                            )}
                            {!sortDirection && (
                              <ArrowUpDown className="h-3 w-3 text-slate-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-slate-500">Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'table-gold-row transition-colors',
                    index % 2 === 0 ? 'bg-slate-900/40 backdrop-blur-xl' : 'bg-slate-900/20 backdrop-blur-lg'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl">📭</span>
                    </div>
                    <p className="text-slate-500">Tidak ada data</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-slate-500">
            Menampilkan <span className="font-medium text-slate-50">{startItem}</span> -{' '}
            <span className="font-medium text-slate-50">{endItem}</span> dari{' '}
            <span className="font-medium text-slate-50">{totalItems}</span> data
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-blue-200 hover:bg-blue-950/40 hover:border-blue-300"
              onClick={() => onPageChange(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-blue-200 hover:bg-blue-950/40 hover:border-blue-300"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let pageNum: number;
                if (pageCount <= 5) {
                  pageNum = i;
                } else if (pageIndex < 2) {
                  pageNum = i;
                } else if (pageIndex > pageCount - 3) {
                  pageNum = pageCount - 5 + i;
                } else {
                  pageNum = pageIndex - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageIndex === pageNum ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'h-9 w-9 text-sm font-medium',
                      pageIndex === pageNum
                        ? 'bg-blue-500 text-slate-950 hover:bg-blue-600'
                        : 'border-blue-200 hover:bg-blue-950/40 hover:border-blue-300'
                    )}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-blue-200 hover:bg-blue-950/40 hover:border-blue-300"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-blue-200 hover:bg-blue-950/40 hover:border-blue-300"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
