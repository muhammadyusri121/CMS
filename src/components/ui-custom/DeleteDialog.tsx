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
      <AlertDialogContent className="max-w-md border-none bg-[#1e293b] sm:rounded-[2rem] rounded-3xl shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] p-6">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold text-red-500">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-slate-500 mt-2 font-medium">
            {description}
            {itemName && (
              <span className="font-bold text-slate-200 block mt-1">
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
            className="rounded-full bg-[#1e293b] text-slate-500 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:text-slate-300 hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] font-bold px-6 h-12 border-none mt-0"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full px-8 h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold"
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
