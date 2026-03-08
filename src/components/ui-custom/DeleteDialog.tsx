import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title = 'Hapus Data',
  description = 'Apakah Anda yakin ingin menghapus data ini?',
  itemName,
  onConfirm,
  isDeleting = false,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md w-[95vw] border border-slate-200 bg-white rounded-xl sm:rounded-2xl shadow-dialog p-4 sm:p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold text-slate-800">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-500 mt-2 text-sm">
            {description}
            {itemName && (
              <span className="font-semibold text-slate-700 block mt-1">
                &quot;{itemName}&quot;
              </span>
            )}
            <span className="block mt-2 text-xs text-red-500 font-medium">
              Tindakan ini tidak dapat dibatalkan.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2.5 flex-col sm:flex-row w-full mt-3">
          <AlertDialogCancel
            disabled={isDeleting}
            className="w-full sm:w-auto rounded-lg bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium px-4 sm:px-5 h-9 sm:h-10 mt-0"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-5 sm:px-6 h-9 sm:h-10 shadow-sm font-medium transition-colors border-none"
          >
            {isDeleting && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
