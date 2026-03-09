import { useState } from 'react';
import { Menu, Mail, KeyRound, BadgeCheck, LogOut, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLayoutStore } from '@/lib/layoutStore';
import { useAuthStore } from '@/lib/authStore';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle: _subtitle }: HeaderProps) {
  const { toggleMobileMenu } = useLayoutStore();
  const { user, logout } = useAuthStore();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<'email' | 'nip' | 'password' | null>(null);

  // Form states
  const [emailValue, setEmailValue] = useState(user?.email || '');
  const [nipValue, setNipValue] = useState('');
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const handleSave = (type: string) => {
    // Static for now — just show a toast
    toast.success(`${type} berhasil diperbarui (demo)`);
    setEditDialog(null);
    setIsPopoverOpen(false);
    // Reset password fields
    setPasswordOld('');
    setPasswordNew('');
    setPasswordConfirm('');
  };

  const openDialog = (type: 'email' | 'nip' | 'password') => {
    setEditDialog(type);
    setIsPopoverOpen(false);
  };

  return (
    <>
      <header className="flex-none z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left: Hamburger & Title */}
          <div className="flex items-center gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg h-9 w-9"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight truncate">
                {title}
              </h1>
              {_subtitle && (
                <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate hidden sm:block">
                  {_subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold select-none hover:bg-primary-200 transition-colors"
            >
              {initials}
            </button>

            {/* Popover Dropdown */}
            {isPopoverOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPopoverOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || '-'}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => openDialog('email')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                      <Mail className="h-4 w-4 text-slate-400" strokeWidth={2} />
                      Ubah Email
                    </button>
                    <button
                      onClick={() => openDialog('nip')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                      <BadgeCheck className="h-4 w-4 text-slate-400" strokeWidth={2} />
                      Ubah NIP
                    </button>
                    <button
                      onClick={() => openDialog('password')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                      <KeyRound className="h-4 w-4 text-slate-400" strokeWidth={2} />
                      Ubah Password
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsPopoverOpen(false);
                        window.location.href = '/login';
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ Edit Dialogs ═══════════ */}
      {editDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditDialog(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setEditDialog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Email Dialog */}
            {editDialog === 'email' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Ubah Email</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Masukkan email baru Anda</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Email Baru</label>
                  <Input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="email@example.com"
                    className="h-10 rounded-lg border-slate-200 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-100"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditDialog(null)} className="h-9 rounded-lg text-sm font-medium px-4">
                    Batal
                  </Button>
                  <Button onClick={() => handleSave('Email')} className="h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4">
                    Simpan
                  </Button>
                </div>
              </div>
            )}

            {/* NIP Dialog */}
            {editDialog === 'nip' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Ubah NIP</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Masukkan NIP baru Anda</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">NIP</label>
                  <Input
                    type="text"
                    value={nipValue}
                    onChange={(e) => setNipValue(e.target.value)}
                    placeholder="Masukkan NIP"
                    className="h-10 rounded-lg border-slate-200 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-100"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditDialog(null)} className="h-9 rounded-lg text-sm font-medium px-4">
                    Batal
                  </Button>
                  <Button onClick={() => handleSave('NIP')} className="h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4">
                    Simpan
                  </Button>
                </div>
              </div>
            )}

            {/* Password Dialog */}
            {editDialog === 'password' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Ubah Password</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Masukkan password lama dan baru</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Password Lama</label>
                    <div className="relative">
                      <Input
                        type={showOldPass ? 'text' : 'password'}
                        value={passwordOld}
                        onChange={(e) => setPasswordOld(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 rounded-lg border-slate-200 text-sm font-medium pr-10 focus-visible:ring-2 focus-visible:ring-primary-100"
                      />
                      <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? 'text' : 'password'}
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 rounded-lg border-slate-200 text-sm font-medium pr-10 focus-visible:ring-2 focus-visible:ring-primary-100"
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Konfirmasi Password</label>
                    <Input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 rounded-lg border-slate-200 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditDialog(null)} className="h-9 rounded-lg text-sm font-medium px-4">
                    Batal
                  </Button>
                  <Button onClick={() => handleSave('Password')} className="h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4">
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
