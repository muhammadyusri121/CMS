import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    getPosts,
    getGraduations,
    getExtracurriculars,
    getEducationPersonnel,
    getFacilities,
    getAcademicDocuments,
    getHolidays
} from '@/actions';

export function ApiTestSection() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFetch = async (fetcher: Function, name: string) => {
        setLoading(true);
        setData({ message: `Fetching ${name}...` });
        try {
            const res = await fetcher({ page: 1, limit: 10 });
            setData(res);
        } catch (err: any) {
            setData({ error: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">API Test GET Data</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Halaman ini dibuat khusus untuk memverifikasi struktur data JSON yang dikembalikan oleh backend.</p>
            </div>

            <div className="flex flex-wrap gap-3 p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                <Button onClick={() => handleFetch(getPosts, 'Posts')} disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-sm">
                    Get Posts
                </Button>
                <Button onClick={() => handleFetch(getExtracurriculars, 'Extracurriculars')} disabled={loading} variant="outline" className="border-slate-200 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Extracurriculars
                </Button>
                <Button onClick={() => handleFetch(getFacilities, 'Facilities')} disabled={loading} variant="outline" className="border-slate-200 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Facilities
                </Button>
                <Button onClick={() => handleFetch(getEducationPersonnel, 'Personnel')} disabled={loading} variant="outline" className="border-slate-200 text-amber-600 hover:bg-amber-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Personnel
                </Button>
                <Button onClick={() => handleFetch(getAcademicDocuments, 'Documents')} disabled={loading} variant="outline" className="border-slate-200 text-purple-600 hover:bg-purple-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Documents
                </Button>
                <Button onClick={() => handleFetch(getGraduations, 'Graduations')} disabled={loading} variant="outline" className="border-slate-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Graduations
                </Button>
                <Button onClick={() => handleFetch(getHolidays, 'Holidays')} disabled={loading} variant="outline" className="border-slate-200 text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-sm font-bold bg-white">
                    Get Holidays
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-6 min-h-[400px] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Respons Raw JSON</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setData(null)}
                        className="h-8 text-slate-500 hover:text-slate-800 rounded-xl shadow-sm border-slate-200 font-bold"
                    >
                        Clear
                    </Button>
                </div>
                <pre className="text-[13px] font-mono font-medium text-slate-600 overflow-auto max-h-[600px] custom-scrollbar bg-slate-50 border border-slate-100 p-6 rounded-xl shadow-inner">
                    {data ? JSON.stringify(data, null, 2) : '// Tekan salah satu tombol di atas untuk melihat data yang Anda masukkan...'}
                </pre>
            </div>
        </div>
    );
}
