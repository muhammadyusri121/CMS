import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    getPosts,
    getGraduations,
    getExtracurriculars,
    getEducationPersonnel,
    getFacilities,
    getAcademicDocuments
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
                <h2 className="text-2xl font-bold text-slate-50">API Test GET Data</h2>
                <p className="text-slate-500">Halaman ini dibuat khusus untuk memverifikasi struktur data JSON yang dikembalikan oleh backend.</p>
            </div>

            <div className="flex flex-wrap gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <Button onClick={() => handleFetch(getPosts, 'Posts')} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Posts
                </Button>
                <Button onClick={() => handleFetch(getExtracurriculars, 'Extracurriculars')} disabled={loading} variant="outline" className="border-blue-800 text-blue-400 hover:bg-blue-900/30">
                    Get Extracurriculars
                </Button>
                <Button onClick={() => handleFetch(getFacilities, 'Facilities')} disabled={loading} variant="outline" className="border-emerald-800 text-emerald-400 hover:bg-emerald-900/30">
                    Get Facilities
                </Button>
                <Button onClick={() => handleFetch(getEducationPersonnel, 'Personnel')} disabled={loading} variant="outline" className="border-amber-800 text-amber-400 hover:bg-amber-900/30">
                    Get Personnel
                </Button>
                <Button onClick={() => handleFetch(getAcademicDocuments, 'Documents')} disabled={loading} variant="outline" className="border-purple-800 text-purple-400 hover:bg-purple-900/30">
                    Get Documents
                </Button>
                <Button onClick={() => handleFetch(getGraduations, 'Graduations')} disabled={loading} variant="outline" className="border-rose-800 text-rose-400 hover:bg-rose-900/30">
                    Get Graduations
                </Button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-300">Respons Raw JSON</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setData(null)}
                        className="h-8 text-slate-400 hover:text-white"
                    >
                        Clear
                    </Button>
                </div>
                <pre className="text-sm font-mono text-emerald-400 overflow-auto max-h-[600px] custom-scrollbar bg-[#0f172a] p-4 rounded-lg">
                    {data ? JSON.stringify(data, null, 2) : '// Tekan salah satu tombol di atas untuk melihat data yang Anda masukkan...'}
                </pre>
            </div>
        </div>
    );
}
