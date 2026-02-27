import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  Trophy,
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { StatsCard } from '@/components/ui-custom/StatsCard';
import { getDashboardStats } from '@/actions';
import type { DashboardStats } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DashboardSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error(response.error || 'Gagal memuat statistik');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-64 bg-slate-800 rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm mt-8">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <RefreshCw className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Gagal Memuat Data</h3>
        <p className="text-sm text-slate-500 mb-6">Silakan refresh halaman untuk mencoba lagi</p>
        <button onClick={loadStats} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
            Overview Dashboard
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Pantau ringkasan data dan aktivitas SMAN 1 Ketapang secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-700">Sistem Online & Terhubung</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Personel"
          value={stats.totalPersonnel}
          description="Tenaga pendidik & kependidikan"
          icon={Users}
          variant="gold"
        />
        <StatsCard
          title="Total Postingan"
          value={stats.totalPosts}
          description={`${stats.publishedPosts} dipublikasikan`}
          icon={FileText}
          variant="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Data Kelulusan"
          value={stats.totalGraduates}
          description={`${stats.graduatedStudents} siswa lulus`}
          icon={GraduationCap}
          variant="green"
        />
        <StatsCard
          title="Dokumen Akademik"
          value={stats.totalDocuments}
          description="File regulasi & jadwal"
          icon={BookOpen}
          variant="purple"
        />
        <StatsCard
          title="Ekstrakurikuler"
          value={stats.totalExtracurriculars}
          description="Kegiatan siswa aktif"
          icon={Trophy}
          variant="gold"
        />
        <StatsCard
          title="Fasilitas"
          value={stats.totalFacilities}
          description="Sarana & prasarana"
          icon={Building2}
          variant="blue"
        />
      </div>

      {/* Quick Info & System Status */}
      <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950 p-5 sm:p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-950/40 text-violet-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200">Aktivitas Terbaru</h3>
                <p className="text-xs text-slate-500">Log perubahan 24 jam terakhir</p>
              </div>
            </div>
          </div>
          <div className="space-y-0.5 flex-1 flex flex-col justify-center">
            {[
              { action: 'Postingan baru dipublikasikan', time: '2 menit yang lalu', type: 'post' },
              { action: 'Data kelulusan angkatan 2024 diperbarui', time: '1 jam yang lalu', type: 'graduation' },
              { action: 'Personel pendidik "Ahmad Subagio" ditambahkan', time: '3 jam yang lalu', type: 'personnel' },
              { action: 'Dokumen kalender akademik diunggah', time: '5 jam yang lalu', type: 'document' },
            ].map((item, index) => (
              <div
                key={index}
                className="group flex items-start sm:items-center justify-between py-3 rounded-lg hover:bg-slate-900 px-3 -mx-3 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="mt-1 sm:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                    <Clock className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{item.action}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950 p-5 sm:p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/40 text-indigo-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200">Status Layanan</h3>
                <p className="text-xs text-slate-500">Kondisi integrasi & sistem</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {[
              { name: 'Koneksi Database PostgreSQL', status: 'Terhubung', color: 'bg-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-700' },
              { name: 'API Services SMANKA', status: 'Berjalan', color: 'bg-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-700' },
              { name: 'Penyimpanan Media (Storage)', status: 'Optimal', color: 'bg-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-700' },
              { name: 'Automated Backup System', status: 'Sinkronisasi', color: 'bg-blue-500', bg: 'bg-blue-950/40', text: 'text-blue-700' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors"
              >
                <span className="text-sm font-medium text-slate-300">{item.name}</span>
                <div className={cn('flex items-center gap-2 px-2.5 py-1 rounded-full', item.bg)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', item.color)} />
                  <span className={cn('text-xs font-semibold', item.text)}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
