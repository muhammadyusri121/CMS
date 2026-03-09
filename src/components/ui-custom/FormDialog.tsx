import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
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
  className?: string;
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
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        className={cn("sm:max-w-[560px] w-[95vw] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 bg-white rounded-xl sm:rounded-2xl shadow-dialog p-0 gap-0", className)}
      >
        <DialogHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-800 pr-6">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-500 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {children}
        </div>

        <DialogFooter className="px-4 py-4 sm:px-6 sm:py-5 border-t border-slate-100 gap-2 flex-col sm:flex-row w-full sm:justify-end shrink-0 bg-slate-50/50">
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
