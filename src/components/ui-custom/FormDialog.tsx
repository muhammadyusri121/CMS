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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto border-none bg-white sm:rounded-[2rem] rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.15)] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-slate-500 font-medium">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full bg-white text-slate-500 shadow-sm border-slate-200 hover:text-slate-700 hover:bg-slate-50 font-bold px-6 h-12"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-8 h-12 shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all font-bold"
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
