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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto border-none bg-[#1e293b] sm:rounded-[2rem] rounded-3xl shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-500 tracking-tight">{title}</DialogTitle>
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
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full bg-[#1e293b] text-slate-500 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:text-slate-300 hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] font-bold px-6 h-12 border-none"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full px-8 h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold"
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
