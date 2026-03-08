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
  PlusCircle,
  Calendar,
  Settings,
  ShieldCheck,
  Megaphone,
  Briefcase
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
      <div className="space-y-8 animate-pulse p-4">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-1/3 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-1/4 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between p-6">
              <div className="flex justify-between w-full">
                <div className="h-4 w-1/3 rounded bg-slate-100"></div>
                <div className="h-4 w-1/6 rounded bg-slate-100"></div>
              </div>
              <div className="flex justify-between w-full mt-4 items-center">
                <div className="flex flex-col gap-2">
                  <div className="h-8 w-24 rounded bg-slate-100"></div>
                  <div className="h-3 w-16 rounded bg-slate-50"></div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-50"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Detailed Skeletons */}
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          <div className="h-80 rounded-[30px] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
          </div>
          <div className="h-80 rounded-[30px] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 shadow-sm mt-8 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50"></div>
        <div className="relative mb-6 group z-10">
          <div className="relative h-20 w-20 rounded-2xl bg-white border border-red-100 flex items-center justify-center shadow-sm">
            <RefreshCw className="h-10 w-10 text-red-500 group-hover:rotate-180 transition-transform duration-700" />
          </div>
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight z-10">Gagal Memuat Data</h3>
        <p className="text-[15px] font-semibold text-slate-500 mb-8 max-w-sm text-center mt-2 z-10">Silakan refresh halaman untuk memuat ulang statistik dashboard Anda.</p>
        <button onClick={loadStats} className="relative px-8 py-3 rounded-xl overflow-hidden group z-10 border-slate-200 bg-white text-red-500 hover:text-white hover:bg-red-500 transition-all font-bold shadow-sm">
          <span className="relative z-10">Coba Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 shadow-[0_20px_40px_rgba(79,70,229,0.2)] border border-white/10">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-20 -translate-x-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-[13px] tracking-wide mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            Sistem Utama Online
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Selamat Datang,<br />Admin Sekolah!
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
            Pusat kendali Content Management System. Kelola publikasi, data akademik, hingga aktivitas siswa dengan mudah dan cepat.
          </p>
        </div>
      </div>

      {/* Quick Action Buttons for Easy Access */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Buat Postingan', desc: 'Berita & Pengumuman', icon: Megaphone, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', link: '/dashboard/posts' },
          { label: 'Kelola Personel', desc: 'Guru & Staf', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', link: '/dashboard/personnel' },
          { label: 'Agenda Libur', desc: 'Kalender Akademik', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', link: '/dashboard/holidays' },
          { label: 'Data Kelulusan', desc: 'Alumni & Siswa Akhir', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', link: '/dashboard/graduation' },
        ].map((action, idx) => (
          <Link to={action.link} key={idx}>
            <div className={`group flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all cursor-pointer h-full text-center relative overflow-hidden`}>
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 ${action.bg} ${action.color}`}>
                <action.icon className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{action.label}</h3>
              <p className="text-[13px] font-semibold text-slate-400 mt-1">{action.desc}</p>

              {/* Hover effect highlight */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlusCircle className={`h-5 w-5 ${action.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 px-1 flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-500" strokeWidth={3} />
          Ringkasan Data
        </h2>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-8">
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

        {/* Quick Info & System Status */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.5fr_1fr]">

          {/* Activity Feed for Admin */}
          <div className="group relative rounded-[32px] bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-8 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8 pl-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Aktivitas Terkini</h3>
                <p className="text-[14px] font-semibold text-slate-500 mt-1">Laporan tindakan terbaru di dalam sistem CMS.</p>
              </div>
            </div>

            <div className="space-y-0 flex-1 flex flex-col relative z-10 w-full">
              <div className="absolute left-[30px] top-6 bottom-6 w-0.5 bg-slate-100 rounded-full z-0"></div>

              {[
                { action: 'Perubahan Data Personel', desc: 'Admin memperbarui profil Guru Budi Sudarsono', time: '12 Menit Lalu', type: 'personnel', color: 'text-purple-500', bg: 'bg-purple-100 border-purple-200' },
                { action: 'Postingan Baru Diterbitkan', desc: 'Artikel "Prestasi OSN 2026" berhasil dipublikasi', time: '1 Jam Lalu', type: 'post', color: 'text-blue-500', bg: 'bg-blue-100 border-blue-200' },
                { action: 'Dokumen Akademik Diunggah', desc: 'Jadwal_Pelajaran_Ganjil_2026.pdf ditambahkan', time: '3 Jam Lalu', type: 'document', color: 'text-emerald-500', bg: 'bg-emerald-100 border-emerald-200' },
                { action: 'Data Baru Diekspor', desc: 'Data kelulusan angkatan 2025 diunduh admin', time: 'Kemarin', type: 'system', color: 'text-amber-500', bg: 'bg-amber-100 border-amber-200' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 py-5 relative z-10 group/item hover:bg-slate-50/80 -mx-6 px-6 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover/item:scale-110 duration-300 ${item.bg} ${item.color} shadow-sm bg-white`}>
                    <Clock className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-lg font-extrabold text-slate-800 tracking-tight group-hover/item:text-blue-600 transition-colors">
                      {item.action}
                    </span>
                    <span className="text-[14px] font-medium text-slate-500 leading-snug mt-1 max-w-md">
                      {item.desc}
                    </span>
                    <span className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-6 text-center">
              <button className="text-[13px] font-extrabold text-blue-600 bg-blue-50 py-3 px-6 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                Lihat Semua Aktivitas
              </button>
            </div>
          </div>

          {/* System & Maintenance Panel */}
          <div className="group relative rounded-[32px] bg-slate-800 border-none shadow-[0_20px_50px_rgba(15,23,42,0.3)] p-8 flex flex-col h-full overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-800 to-slate-900 border border-white/5 rounded-[32px]"></div>

            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-emerald-400 border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
                  <Settings className="h-7 w-7 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Sistem & Server</h3>
                  <p className="text-[13px] font-semibold text-slate-400 mt-0.5 tracking-wide">Status Layanan Digital</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center relative z-10">
              {[
                { name: 'Koneksi Database Utama', status: 'Terhubung', badgeCore: 'bg-emerald-500/20 text-emerald-400', badgeBorder: 'border border-emerald-500/30' },
                { name: 'API Gateway & Services', status: 'Optimal', badgeCore: 'bg-emerald-500/20 text-emerald-400', badgeBorder: 'border border-emerald-500/30' },
                { name: 'Penyimpanan Media (Aset)', status: 'Berjalan', badgeCore: 'bg-emerald-500/20 text-emerald-400', badgeBorder: 'border border-emerald-500/30' },
                { name: 'Backup Data Otomatis', status: 'Terjadwal', badgeCore: 'bg-blue-500/20 text-blue-400', badgeBorder: 'border border-blue-500/30' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    <span className="text-[14px] font-bold tracking-wide text-slate-200">{item.name}</span>
                  </div>

                  <span className={cn('text-[11px] font-extrabold tracking-wider px-4 py-1.5 rounded-full', item.badgeCore, item.badgeBorder)}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Sistem Operasional</p>
                <p className="text-[15px] font-extrabold mt-1 text-slate-200">Performa Baik (Uptime 99%)</p>
              </div>
              <button className="text-[12px] font-extrabold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-all border border-white/10">
                Jalankan Tes
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
