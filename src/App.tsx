import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/ui-custom/Sidebar';
import { Header } from '@/components/ui-custom/Header';
import { DashboardSection } from '@/sections/DashboardSection';
import { PersonnelSection } from '@/sections/PersonnelSection';
import { PostsSection } from '@/sections/PostsSection';
import { GraduationSection } from '@/sections/GraduationSection';
import { DocumentsSection } from '@/sections/DocumentsSection';
import { ExtracurricularSection } from '@/sections/ExtracurricularSection';
import { FacilitiesSection } from '@/sections/FacilitiesSection';
import { LoginSection } from '@/sections/LoginSection';
import { UsersSection } from '@/sections/UsersSection';
import { HolidaysSection } from '@/sections/HolidaysSection';
import { ScheduleSection } from '@/sections/ScheduleSection';
import { ApiTestSection } from '@/sections/ApiTestSection';
import { useAuthStore } from '@/lib/authStore';
import { useLayoutStore } from '@/lib/layoutStore';

// Protected Route Wrapper
function ProtectedRoute({ children, allowRole }: { children: React.ReactNode, allowRole?: string }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowRole && user?.role !== allowRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Layout Component
function DashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { isSidebarCollapsed } = useLayoutStore();

  return (
    <div className="h-screen bg-[#020617] text-slate-800 selection:bg-cyan-500/30 relative overflow-hidden font-sans">
      {/* Deep Navy to Purple/Red Gradient Background */}
      <div className="absolute inset-0 bg-[#0f172a] z-0">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-rose-900/20 opacity-80 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#1e1b4b]/60 to-transparent pointer-events-none" />
      </div>

      {/* Main Glass Workspace */}
      <div className="relative z-10 h-screen p-4 lg:p-6 flex gap-6">
        <Sidebar />

        {/* Main Content Area (Glass Container overlaying gradient) */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative ${isSidebarCollapsed ? 'lg:ml-[90px]' : 'lg:ml-[280px]'}`}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 h-full overflow-hidden flex flex-col relative w-full mb-2">
            <Header title={title} subtitle={subtitle} />
            <main className="flex-1 p-6 lg:p-10 overflow-x-hidden overflow-y-auto custom-scrollbar">
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page Components
function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Selamat datang di Admin SMAN 1 Ketapang">
      <DashboardSection />
    </DashboardLayout>
  );
}

function PersonnelPage() {
  return (
    <DashboardLayout title="Personel Pendidik" subtitle="Kelola data tenaga pendidik">
      <PersonnelSection />
    </DashboardLayout>
  );
}

function PostsPage() {
  return (
    <DashboardLayout title="Postingan" subtitle="Kelola berita dan konten">
      <PostsSection />
    </DashboardLayout>
  );
}

function GraduationPage() {
  return (
    <DashboardLayout title="Data Kelulusan" subtitle="Kelola data kelulusan siswa">
      <GraduationSection />
    </DashboardLayout>
  );
}

function DocumentsPage() {
  return (
    <DashboardLayout title="Dokumen Akademik" subtitle="Kelola dokumen dan regulasi">
      <DocumentsSection />
    </DashboardLayout>
  );
}

function HolidaysPage() {
  return (
    <DashboardLayout title="Kalender Libur" subtitle="Kelola kalender dan perayaan">
      <HolidaysSection />
    </DashboardLayout>
  );
}

function SchedulePage() {
  return (
    <DashboardLayout title="Jadwal Pelajaran" subtitle="Kelola jadwal pelajaran sekolah">
      <ScheduleSection />
    </DashboardLayout>
  );
}

function ExtracurricularPage() {
  return (
    <DashboardLayout title="Ekstrakurikuler" subtitle="Kelola kegiatan siswa">
      <ExtracurricularSection />
    </DashboardLayout>
  );
}

function FacilitiesPage() {
  return (
    <DashboardLayout title="Fasilitas" subtitle="Kelola sarana dan prasarana">
      <FacilitiesSection />
    </DashboardLayout>
  );
}

function UsersPage() {
  return (
    <DashboardLayout title="Pengelola Sistem" subtitle="Kelola pengguna admin dan role">
      <UsersSection />
    </DashboardLayout>
  );
}

function ApiTestPage() {
  return (
    <DashboardLayout title="Uji Data API" subtitle="Ujicoba get data JSON murni">
      <ApiTestSection />
    </DashboardLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #93c5fd',
            borderRadius: '0.5rem',
          },
          className: 'toast-gold',
        }}
        richColors
      />
      <Routes>
        <Route path="/login" element={<LoginSection />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/personnel" element={<ProtectedRoute><PersonnelPage /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
        <Route path="/graduation" element={<ProtectedRoute><GraduationPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        <Route path="/holidays" element={<ProtectedRoute><HolidaysPage /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
        <Route path="/extracurricular" element={<ProtectedRoute><ExtracurricularPage /></ProtectedRoute>} />
        <Route path="/facilities" element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />
        <Route path="/test-api" element={<ProtectedRoute><ApiTestPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowRole="ADMIN"><UsersPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
