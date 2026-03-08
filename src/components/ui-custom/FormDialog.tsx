import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] w-[95vw] max-h-[90vh] overflow-auto border border-slate-200 bg-white rounded-xl sm:rounded-2xl shadow-dialog p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-800">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-500">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2 sm:py-3">
          {children}
        </div>

        <DialogFooter className="gap-2 sm:gap-2.5 flex-col sm:flex-row w-full sm:w-auto mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-lg bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium px-4 sm:px-5 h-9 sm:h-10"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 sm:px-6 h-9 sm:h-10 shadow-sm font-medium transition-colors"
          >
            {isSubmitting && (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
