import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/ui-custom/Sidebar';
import { Header } from '@/components/ui-custom/Header';
import { Dashboard } from '@/sections/Dashboard';
import { Personnel } from '@/sections/Personnel';
import { Posts } from '@/sections/Posts';
import { Graduation } from '@/sections/Graduation';
import { Documents } from '@/sections/Documents';
import { Extracurricular } from '@/sections/Extracurricular';
import { Facilities } from '@/sections/Facilities';
import { Login } from '@/sections/Login';
import { Users } from '@/sections/Users';
import { Holidays } from '@/sections/Holidays';
import { Schedule } from '@/sections/Schedule';
import { ApiTest } from '@/sections/ApiTest';
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
    <div className="fixed inset-0 bg-slate-100 text-slate-800 selection:bg-primary-500/20 font-sans overflow-hidden">
      <div className="flex h-full w-full relative">
        <Sidebar />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col h-full min-w-0 w-full transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[250px]'}`}>
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 sm:p-5 lg:p-6 relative">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Page Components
function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Selamat datang di Admin SMAN 1 Ketapang">
      <Dashboard />
    </DashboardLayout>
  );
}

function PersonnelPage() {
  return (
    <DashboardLayout title="Personel Pendidik" subtitle="Kelola data tenaga pendidik">
      <Personnel />
    </DashboardLayout>
  );
}

function PostsPage() {
  return (
    <DashboardLayout title="Postingan" subtitle="Kelola berita dan konten">
      <Posts />
    </DashboardLayout>
  );
}

function GraduationPage() {
  return (
    <DashboardLayout title="Data Kelulusan" subtitle="Kelola data kelulusan siswa">
      <Graduation />
    </DashboardLayout>
  );
}

function DocumentsPage() {
  return (
    <DashboardLayout title="Dokumen Akademik" subtitle="Kelola dokumen dan regulasi">
      <Documents />
    </DashboardLayout>
  );
}

function HolidaysPage() {
  return (
    <DashboardLayout title="Kalender Libur" subtitle="Kelola kalender dan perayaan">
      <Holidays />
    </DashboardLayout>
  );
}

function SchedulePage() {
  return (
    <DashboardLayout title="Jadwal Pelajaran" subtitle="Kelola jadwal pelajaran sekolah">
      <Schedule />
    </DashboardLayout>
  );
}

function ExtracurricularPage() {
  return (
    <DashboardLayout title="Ekstrakurikuler" subtitle="Kelola kegiatan siswa">
      <Extracurricular />
    </DashboardLayout>
  );
}

function FacilitiesPage() {
  return (
    <DashboardLayout title="Fasilitas" subtitle="Kelola sarana dan prasarana">
      <Facilities />
    </DashboardLayout>
  );
}

function UsersPage() {
  return (
    <DashboardLayout title="Pengelola Sistem" subtitle="Kelola pengguna admin dan role">
      <Users />
    </DashboardLayout>
  );
}

function ApiTestPage() {
  return (
    <DashboardLayout title="Uji Data API" subtitle="Ujicoba get data JSON murni">
      <ApiTest />
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
        <Route path="/login" element={<Login />} />
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
