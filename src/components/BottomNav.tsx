import { BarChart3, Calendar, Home, Plus, User } from 'lucide-react';
import { NavTab } from '../lib/types';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewModal: () => void;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenNewModal,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Navigasi Bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2"
    >
      <div className="grid grid-cols-5 items-center h-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'home' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" aria-hidden="true" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('jadwal')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'jadwal' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          <span>Jadwal</span>
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenNewModal}
            aria-label="Buat Ide Konten Baru"
            className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm hover:bg-slate-800 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('analitik')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'analitik' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
          <span>Analitik</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('profil')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'profil' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" aria-hidden="true" />
          <span>Profil</span>
        </button>
      </div>
    </nav>
  );
}
