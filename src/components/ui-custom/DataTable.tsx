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
    <div className="space-y-3">
      {/* Table */}
      <div className="rounded-xl border border-slate-200/60 bg-white shadow-card w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <Table className="w-full min-w-[640px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-primary-100 border-b border-primary-200 hover:bg-primary-100"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'text-slate-900 font-bold text-[11px] sm:text-xs uppercase tracking-wider py-3 px-4',
                          isSortable && 'cursor-pointer select-none'
                        )}
                        onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          {isSortable && (
                            <span className="inline-flex">
                              {sortDirection === 'asc' && (
                                <ArrowUp className="h-3.5 w-3.5 text-primary-500" />
                              )}
                              {sortDirection === 'desc' && (
                                <ArrowDown className="h-3.5 w-3.5 text-primary-500" />
                              )}
                              {!sortDirection && (
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
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
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                      <span className="text-slate-400 font-medium text-sm">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'transition-colors duration-150 border-b border-slate-100',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                      'hover:bg-primary-50/30'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 text-[13px] sm:text-sm">
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
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 py-8">
                      <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <span className="text-2xl opacity-50 grayscale">📭</span>
                      </div>
                      <p className="text-slate-400 font-semibold text-sm mt-1">Tidak ada data</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1">
          <div className="text-xs sm:text-[13px] text-slate-500 font-medium">
            Menampilkan <span className="font-semibold text-slate-700">{startItem}</span> –{' '}
            <span className="font-semibold text-slate-700">{endItem}</span> dari{' '}
            <span className="font-semibold text-slate-700">{totalItems}</span> data
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500 shadow-xs hover:text-primary-600 hover:border-primary-200 lg:flex hidden disabled:opacity-40"
              onClick={() => onPageChange(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500 shadow-xs hover:text-primary-600 hover:border-primary-200 disabled:opacity-40"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>

            <div className="flex items-center gap-0.5 mx-1">
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
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-8 w-8 text-xs font-semibold rounded-lg transition-all shadow-xs border-slate-200',
                      pageIndex === pageNum
                        ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:text-white'
                        : 'bg-white text-slate-500 hover:text-primary-600 hover:border-primary-200'
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
              className="h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500 shadow-xs hover:text-primary-600 hover:border-primary-200 disabled:opacity-40"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500 shadow-xs hover:text-primary-600 hover:border-primary-200 lg:flex hidden disabled:opacity-40"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
