import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  Trophy,
  Building2,
  Activity,
  Clock,
  RefreshCw,
  Megaphone,
  Calendar,
  Settings,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { StatsCard } from '@/components/ui-custom/StatsCard';
import { getDashboardStats } from '@/actions';
import type { DashboardStats } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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
        {/* Banner Skeleton */}
        <div className="h-36 rounded-xl bg-slate-100" />

        {/* Quick Actions Skeleton */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white border border-slate-100" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[100px] rounded-xl bg-white border border-slate-100 p-4">
              <div className="h-3 w-2/3 rounded bg-slate-100 mb-3" />
              <div className="h-6 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/60 shadow-card rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent" />
        <div className="relative mb-4 z-10">
          <div className="h-14 w-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 z-10">Gagal Memuat Data</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs text-center mt-1 z-10">Silakan refresh halaman untuk memuat ulang statistik dashboard.</p>
        <button onClick={loadStats} className="px-5 py-2 rounded-lg bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors font-medium text-sm z-10 shadow-xs">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner — Compact */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-5 sm:p-6 shadow-card">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 text-white/90 font-medium text-[11px] tracking-wide mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Sistem Online
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Selamat Datang, Admin!
            </h1>
            <p className="text-primary-100 text-xs sm:text-sm font-medium max-w-lg">
              Pusat kendali CMS — kelola publikasi, data akademik, dan aktivitas siswa.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Buat Postingan', desc: 'Berita & Pengumuman', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/posts' },
          { label: 'Kelola Personel', desc: 'Guru & Staf', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', link: '/personnel' },
          { label: 'Agenda Libur', desc: 'Kalender Akademik', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/holidays' },
          { label: 'Data Kelulusan', desc: 'Alumni & Siswa', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50', link: '/graduation' },
        ].map((action, idx) => (
          <Link to={action.link} key={idx}>
            <div className="group flex items-center gap-3 p-3 sm:p-4 bg-white border border-slate-200/60 rounded-xl shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all h-full">
              <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 duration-200 ${action.bg} ${action.color}`}>
                <action.icon className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] sm:text-sm font-semibold text-slate-700 leading-tight truncate">{action.label}</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{action.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 ml-auto shrink-0 transition-colors hidden sm:block" />
            </div>
          </Link>
        ))}
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 pt-2">
        <Activity className="h-4 w-4 text-primary-500" strokeWidth={2.5} />
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Ringkasan Data</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Personel"
          value={stats.totalPersonnel}
          description="Pendidik & Staf"
          icon={Users}
          variant="gold"
        />
        <StatsCard
          title="Postingan"
          value={stats.totalPosts}
          description={`${stats.publishedPosts} Publik`}
          icon={FileText}
          variant="blue"
          trend={{ value: 100, isPositive: true }}
        />
        <StatsCard
          title="Kelulusan"
          value={stats.totalGraduates}
          description={`${stats.graduatedStudents} Lulus`}
          icon={GraduationCap}
          variant="green"
        />
        <StatsCard
          title="Dokumen"
          value={stats.totalDocuments}
          description="Regulasi dll"
          icon={BookOpen}
          variant="purple"
        />
        <StatsCard
          title="Ekskul"
          value={stats.totalExtracurriculars}
          description="Kegiatan Aktif"
          icon={Trophy}
          variant="gold"
        />
        <StatsCard
          title="Sarpras"
          value={stats.totalFacilities}
          description="Fasilitas Sekolah"
          icon={Building2}
          variant="blue"
        />
      </div>

      {/* Activity Feed & System Status */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-[1.5fr_1fr]">

        {/* Activity Feed */}
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-card p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Aktivitas Terkini</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tindakan terbaru di sistem CMS</p>
            </div>
          </div>

          <div className="space-y-0 flex-1 relative">
            <div className="absolute left-[18px] top-4 bottom-4 w-px bg-slate-100 z-0" />

            {[
              { action: 'Perubahan Data Personel', desc: 'Admin memperbarui profil Guru Budi Sudarsono', time: '12 Menit Lalu', color: 'text-purple-600', bg: 'bg-purple-50' },
              { action: 'Postingan Baru Diterbitkan', desc: 'Artikel "Prestasi OSN 2026" berhasil dipublikasi', time: '1 Jam Lalu', color: 'text-blue-600', bg: 'bg-blue-50' },
              { action: 'Dokumen Akademik Diunggah', desc: 'Jadwal_Pelajaran_Ganjil_2026.pdf ditambahkan', time: '3 Jam Lalu', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { action: 'Data Baru Diekspor', desc: 'Data kelulusan angkatan 2025 diunduh admin', time: 'Kemarin', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-3 relative z-10 hover:bg-slate-50/60 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200', item.bg, item.color)}>
                  <Clock className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {item.action}
                  </span>
                  <span className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-1">
                    {item.desc}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wide">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & Maintenance Panel */}
        <div className="bg-slate-800 rounded-xl shadow-card p-5 sm:p-6 flex flex-col text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-slate-800 to-slate-900 rounded-xl" />

          <div className="relative z-10 flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400 border border-white/10">
              <Settings className="h-5 w-5 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Sistem & Server</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Status Layanan Digital</p>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center relative z-10">
            {[
              { name: 'Database Utama', status: 'Terhubung', ok: true },
              { name: 'API Gateway', status: 'Optimal', ok: true },
              { name: 'Media Storage', status: 'Berjalan', ok: true },
              { name: 'Backup Otomatis', status: 'Terjadwal', ok: false },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('h-2 w-2 rounded-full', item.ok ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]')} />
                  <span className="text-[13px] font-medium text-slate-200">{item.name}</span>
                </div>

                <span className={cn(
                  'text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full',
                  item.ok ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                )}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-4 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Sistem</p>
              <p className="text-[13px] font-semibold mt-0.5 text-slate-200">Performa Baik (Uptime 99%)</p>
            </div>
            <button className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
              Jalankan Tes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
