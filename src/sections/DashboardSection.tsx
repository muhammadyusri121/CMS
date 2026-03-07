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
      <div className="space-y-8 animate-pulse p-4">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-1/3 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-1/4 bg-slate-800 rounded-lg"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[30px] bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] relative overflow-hidden flex flex-col justify-between p-6 items-center">
              <div className="h-14 w-14 rounded-2xl bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]"></div>
              <div className="h-10 w-full rounded-full bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] mt-auto"></div>
            </div>
          ))}
        </div>

        {/* Bottom Detailed Skeletons */}
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          <div className="h-80 rounded-[30px] bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] relative overflow-hidden">
          </div>
          <div className="h-80 rounded-[30px] bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] relative overflow-hidden">
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-8 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative mb-6 group z-10">
          <div className="relative h-20 w-20 rounded-2xl bg-slate-800/50 border border-white/10 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <RefreshCw className="h-10 w-10 text-red-400 group-hover:rotate-180 transition-transform duration-700 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide z-10">Gagal Memuat Data</h3>
        <p className="text-sm font-medium text-slate-400 mb-8 max-w-sm text-center mt-2 z-10">Silakan refresh halaman untuk memuat ulang statistik dashboard Anda.</p>
        <button onClick={loadStats} className="relative px-8 py-3 rounded-xl overflow-hidden group z-10 border border-white/10 bg-slate-800/50 hover:bg-slate-700/50 transition-all font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 via-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,1)] rounded-r-full" />
          <span className="relative z-10">Coba Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-200 drop-shadow-sm">
            Overview Dashboard
          </h2>
          <p className="text-sm font-bold text-cyan-500 tracking-wide uppercase">
            PANTAU RINGKASAN DATA DAN AKTIVITAS SMAN 1 KETAPANG.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1e293b] border-none shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
          </span>
          <span className="text-xs font-bold text-cyan-500 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] px-1">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
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
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
        {/* Recent Activity */}
        <div className="group relative rounded-[30px] bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] p-6 sm:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1e293b] text-cyan-500 transition-all duration-300 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200 tracking-wide">Aktivitas Terbaru</h3>
                <p className="text-xs font-semibold text-cyan-500 tracking-wide mt-1 uppercase">LOG PERUBAHAN 24 JAM TERAKHIR</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center relative z-10">
            {[
              { action: 'Postingan baru dipublikasikan', time: '2 menit yang lalu', type: 'post' },
              { action: 'Data kelulusan angkatan 2024 diperbarui', time: '1 jam yang lalu', type: 'graduation' },
              { action: 'Personel pendidik "Ahmad Subagio" ditambahkan', time: '3 jam yang lalu', type: 'personnel' },
              { action: 'Dokumen kalender akademik diunggah', time: '5 jam yang lalu', type: 'document' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start sm:items-center justify-between py-4 px-5 rounded-[20px] bg-[#1e293b] hover:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all duration-300 cursor-pointer shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] group/item"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-slate-400 group-hover/item:text-cyan-500 transition-all shadow-[inset_2px_2px_5px_#0f172a,inset_-2px_-2px_5px_#334155]">
                    <Clock className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover/item:text-cyan-600 transition-colors">
                    {item.action}
                  </span>
                </div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="group relative rounded-[30px] bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155] p-6 sm:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1e293b] text-cyan-500 transition-all duration-300 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200 tracking-wide">Status Layanan</h3>
                <p className="text-xs font-semibold text-cyan-500 tracking-wide mt-1 uppercase">KONDISI INTEGRASI & SISTEM JARINGAN</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center relative z-10">
            {[
              { name: 'Koneksi Database PostgreSQL', status: 'Terhubung', badgeCore: 'bg-emerald-50 text-emerald-600', badgeBorder: 'shadow-[inset_2px_2px_5px_rgba(16,185,129,0.2),inset_-2px_-2px_5px_white]' },
              { name: 'API Services SMANKA', status: 'Berjalan', badgeCore: 'bg-emerald-50 text-emerald-600', badgeBorder: 'shadow-[inset_2px_2px_5px_rgba(16,185,129,0.2),inset_-2px_-2px_5px_white]' },
              { name: 'Penyimpanan Media (Storage)', status: 'Optimal', badgeCore: 'bg-emerald-50 text-emerald-600', badgeBorder: 'shadow-[inset_2px_2px_5px_rgba(16,185,129,0.2),inset_-2px_-2px_5px_white]' },
              { name: 'Automated Backup System', status: 'Sinkronisasi', badgeCore: 'bg-cyan-50 text-cyan-600', badgeBorder: 'shadow-[inset_2px_2px_5px_rgba(6,182,212,0.2),inset_-2px_-2px_5px_white]' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 px-5 rounded-[20px] bg-[#1e293b] hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] transition-colors group/item shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full bg-[#1e293b] shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] group-hover/item:bg-cyan-400 group-hover/item:shadow-none transition-colors" />
                  <span className="text-sm font-bold tracking-wide text-slate-300 group-hover/item:text-cyan-600 transition-colors">{item.name}</span>
                </div>

                <span className={cn('text-[11px] font-bold tracking-wider px-4 py-2 rounded-full border-none', item.badgeCore, item.badgeBorder)}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
