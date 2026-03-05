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
      <div className="rounded-3xl border-none bg-[#ecf0f3] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] p-2 overflow-hidden">
        <div className="rounded-2xl overflow-hidden bg-[#ecf0f3]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-[#ecf0f3] border-none shadow-[inset_0px_-2px_5px_rgba(0,0,0,0.05)] hover:bg-[#ecf0f3]"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'text-slate-500 font-bold text-xs uppercase tracking-widest',
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
                                <ArrowUp className="h-4 w-4 text-cyan-500" />
                              )}
                              {sortDirection === 'desc' && (
                                <ArrowDown className="h-4 w-4 text-cyan-500" />
                              )}
                              {!sortDirection && (
                                <ArrowUpDown className="h-4 w-4 text-slate-400" />
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
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                      <span className="text-slate-500 font-bold tracking-wide">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'transition-all duration-300 border-none',
                      index % 2 === 0 ? 'bg-[#ecf0f3]' : 'bg-[#e8ecef]',
                      'hover:bg-[#ecf0f3] hover:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]'
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
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="h-16 w-16 rounded-full bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
                        <span className="text-3xl opacity-50 grayscale">📭</span>
                      </div>
                      <p className="text-slate-500 font-bold">Tidak ada data</p>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
          <div className="text-sm text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700">{startItem}</span> -{' '}
            <span className="font-bold text-slate-700">{endItem}</span> dari{' '}
            <span className="font-bold text-slate-700">{totalItems}</span> data
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border-none bg-[#ecf0f3] text-slate-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:text-cyan-500 hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] lg:flex hidden disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border-none bg-[#ecf0f3] text-slate-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:text-cyan-500 hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </Button>

            <div className="flex items-center gap-3 mx-1">
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
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-10 w-10 text-[15px] font-bold rounded-full transition-all border-none',
                      pageIndex === pageNum
                        ? 'bg-cyan-500 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),2px_2px_8px_rgba(0,0,0,0.1)] hover:bg-cyan-500 hover:text-white'
                        : 'bg-[#ecf0f3] text-slate-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:text-cyan-500 hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]'
                    )}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border-none bg-[#ecf0f3] text-slate-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:text-cyan-500 hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border-none bg-[#ecf0f3] text-slate-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:text-cyan-500 hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] lg:flex hidden disabled:opacity-50 disabled:shadow-none"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronsRight className="h-5 w-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
