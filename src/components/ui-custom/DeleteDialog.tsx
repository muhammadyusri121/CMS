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
      <AlertDialogContent className="max-w-md border-none bg-white sm:rounded-[2rem] rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-red-50 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-extrabold text-slate-800">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-500 mt-2 font-medium">
            {description}
            {itemName && (
              <span className="font-extrabold text-slate-800 block mt-1">
                &quot;{itemName}&quot;
              </span>
            )}
            <span className="block mt-2 text-sm text-red-500 font-bold">
              Tindakan ini tidak dapat dibatalkan.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 mt-4">
          <AlertDialogCancel
            disabled={isDeleting}
            className="rounded-full bg-white text-slate-600 shadow-sm border-slate-200 hover:text-slate-800 hover:bg-slate-50 font-bold px-6 h-12 mt-0"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full px-8 h-12 shadow-[0_8px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_24px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all font-bold border-none"
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
