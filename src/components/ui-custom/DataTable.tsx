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
      <div className="rounded-[30px] border border-slate-100 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden w-full">
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-slate-50/80 border-none hover:bg-slate-50/80 px-4"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'text-slate-500 font-extrabold text-sm uppercase tracking-widest py-4',
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
                                <ArrowUp className="h-4 w-4 text-blue-500" />
                              )}
                              {sortDirection === 'desc' && (
                                <ArrowDown className="h-4 w-4 text-blue-500" />
                              )}
                              {!sortDirection && (
                                <ArrowUpDown className="h-4 w-4 text-slate-300" />
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
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                      <span className="text-slate-500 font-extrabold text-lg tracking-wide">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'transition-all duration-300 border-b border-dashed border-slate-200 px-4',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30',
                      'hover:bg-blue-50/20'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-6 text-[15px]">
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
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="h-20 w-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center -rotate-6">
                        <span className="text-4xl opacity-50 grayscale">📭</span>
                      </div>
                      <p className="text-slate-400 font-extrabold text-lg mt-2">Tidak ada data</p>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 pt-4 pb-2">
          <div className="text-[15px] text-slate-500 font-medium">
            Menampilkan <span className="font-extrabold text-slate-800">{startItem}</span> -{' '}
            <span className="font-extrabold text-slate-800">{endItem}</span> dari{' '}
            <span className="font-extrabold text-slate-800">{totalItems}</span> data
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-200 lg:flex hidden disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-5 w-5" strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </Button>

            <div className="flex items-center gap-1.5 mx-2">
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
                      'h-11 w-11 text-[15px] font-extrabold rounded-xl transition-all shadow-sm border-slate-200',
                      pageIndex === pageNum
                        ? 'bg-slate-800 border-transparent text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:bg-slate-700 hover:text-white'
                        : 'bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200'
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
              className="h-11 w-11 rounded-xl border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-200 lg:flex hidden disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRight className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
