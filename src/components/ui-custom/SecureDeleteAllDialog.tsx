import { AlertCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecureDeleteAllDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    confirmCode: string;
    userCodeInput: string;
    setUserCodeInput: (val: string) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title: string;
    description: string;
}

export function SecureDeleteAllDialog({
    open,
    onOpenChange,
    confirmCode,
    userCodeInput,
    setUserCodeInput,
    onConfirm,
    isDeleting,
    title,
    description
}: SecureDeleteAllDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md w-[95vw] border border-slate-200 bg-white rounded-2xl shadow-dialog p-6 text-left">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-bold text-slate-800">
                                {title}
                            </AlertDialogTitle>
                        </div>
                    </div>
                    <AlertDialogDescription className="text-slate-500 mt-4 leading-relaxed">
                        <p className="font-medium text-slate-600">{description}</p>
                        <p className="mt-2 text-sm text-slate-500">Ketikkan kode konfirmasi di bawah ini untuk melanjutkan:</p>
                        
                        <div className="my-5 p-4 bg-slate-900 rounded-xl flex items-center justify-center select-none shadow-inner border border-slate-800 transform hover:scale-[1.02] transition-transform">
                            <span className="text-3xl font-black text-amber-400 tracking-[0.4em] font-mono drop-shadow-sm">
                                {confirmCode}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Input
                                value={userCodeInput}
                                onChange={(e) => setUserCodeInput(e.target.value.toUpperCase())}
                                placeholder="Ketik 5 karakter di atas..."
                                className="h-12 text-center text-lg font-bold tracking-widest border-slate-200 focus-visible:ring-rose-100 focus-visible:border-rose-400 rounded-xl"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && userCodeInput === confirmCode) {
                                        onConfirm();
                                    }
                                }}
                            />
                            {userCodeInput.length > 0 && userCodeInput !== confirmCode && (
                                <p className="text-[11px] text-rose-500 font-bold animate-pulse text-center">
                                    Kode belum sesuai...
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-6 sm:flex-row flex-col">
                    <AlertDialogCancel className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex-1 order-2 sm:order-1" disabled={isDeleting}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={userCodeInput !== confirmCode || isDeleting}
                        className={cn(
                            "h-11 rounded-xl text-white font-bold shadow-sm transition-all flex-1 order-1 sm:order-2",
                            userCodeInput === confirmCode 
                                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" 
                                : "bg-slate-300 pointer-events-none opacity-50"
                        )}
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Menghapus...</span>
                            </div>
                        ) : (
                            "Ya, Hapus Semua"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
