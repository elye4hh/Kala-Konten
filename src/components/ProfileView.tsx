import { useState } from 'react';
import { RotateCcw, Users } from 'lucide-react';
import {
  AudienceSegment,
  Platform,
  WorkspacePreferences,
} from '../lib/types';

interface ProfileViewProps {
  preferences: WorkspacePreferences;
  completedCount: number;
  currentIteration: number;
  onUpdatePreferences: (next: WorkspacePreferences) => void;
  onResetDemoData: () => void;
}

const AUDIENCES: AudienceSegment[] = ['Gen Z', 'Mahasiswa', 'Umum'];
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube Shorts'];

export function ProfileView({
  preferences,
  completedCount,
  currentIteration,
  onUpdatePreferences,
  onResetDemoData,
}: ProfileViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const togglePreferredPlatform = (platform: Platform) => {
    const exists = preferences.preferredPlatforms.includes(platform);
    const updated = exists
      ? preferences.preferredPlatforms.length > 1
        ? preferences.preferredPlatforms.filter((p) => p !== platform)
        : preferences.preferredPlatforms
      : [...preferences.preferredPlatforms, platform];
    onUpdatePreferences({
      ...preferences,
      preferredPlatforms: updated,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Profil Tim &amp; Preferensi Alur
          </h1>
          <p className="text-sm text-slate-600">
            Pengaturan standar audiens, target mingguan, dan kredit penyusun flowchart.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Iterasi Aktif: #{currentIteration} · Siklus Selesai: {completedCount}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Credits */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {preferences.teamName}
              </h2>
              <p className="text-xs text-slate-500">
                Penyusun Sketsa Flowchart &amp; Siklus Iteratif
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              Model penjadwalan 9 langkah ini menggabungkan riset relevansi audiens, uji kualitas pra-publikasi, pemilihan jam tayang optimal, serta umpan balik analitik untuk memulai iterasi berikutnya.
            </p>
            <div className="pt-2 flex flex-wrap gap-x-3 gap-y-1 text-slate-800 font-medium">
              {preferences.authors.map((member, idx) => (
                <span key={member}>
                  {idx + 1}. {member}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900">
            Preferensi Ruang Kerja
          </h2>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Audiens Bawaan untuk Ide Baru
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {AUDIENCES.map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ ...preferences, defaultAudience: aud })
                  }
                  className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    preferences.defaultAudience === aud
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="weekly-target-range"
              className="flex items-center justify-between text-xs font-semibold text-slate-700"
            >
              <span>Target Publikasi Mingguan</span>
              <span className="font-mono tabular-nums text-slate-900">
                {preferences.weeklyTarget} konten/minggu
              </span>
            </label>
            <input
              id="weekly-target-range"
              type="range"
              min={1}
              max={7}
              value={preferences.weeklyTarget}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  weeklyTarget: Number(e.target.value),
                })
              }
              className="w-full accent-slate-900"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Platform Prioritas
            </span>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((plat) => {
                const selected = preferences.preferredPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePreferredPlatform(plat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Reset Demo Data */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">
            Atur Ulang Data Simulasi
          </h2>
          <p className="text-xs text-slate-500">
            Kembalikan draf aktif, riwayat iterasi, dan pengaturan ke kondisi awal.
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Data</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onResetDemoData();
                setConfirmReset(false);
              }}
              className="px-4 py-2 min-h-[40px] rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold whitespace-nowrap"
            >
              Ya, Kembalikan Awal
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
