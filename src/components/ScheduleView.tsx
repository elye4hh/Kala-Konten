import { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Search } from 'lucide-react';
import { OPTIMAL_SLOTS_BY_AUDIENCE } from '../lib/seedData';
import { AudienceSegment, ContentCycleItem, Platform } from '../lib/types';
import { MediaThumb } from './MediaThumb';

interface ScheduleViewProps {
  items: ContentCycleItem[];
  onToggleItemStatus: (id: string) => void;
  onOpenNewModal: () => void;
}

const PLATFORM_FILTERS: (Platform | 'Semua')[] = [
  'Semua',
  'Instagram',
  'TikTok',
  'YouTube Shorts',
];

const AUDIENCE_SEGMENTS: AudienceSegment[] = ['Gen Z', 'Mahasiswa', 'Umum'];

export function ScheduleView({
  items,
  onToggleItemStatus,
  onOpenNewModal,
}: ScheduleViewProps) {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'Semua'>('Semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'scheduled' | 'published'>('semua');
  const [query, setQuery] = useState('');
  const [slotAudience, setSlotAudience] = useState<AudienceSegment>('Gen Z');

  const filteredItems = items.filter((item) => {
    const matchPlatform =
      platformFilter === 'Semua' || item.platforms.includes(platformFilter);
    const matchStatus =
      statusFilter === 'semua' || item.status === statusFilter;
    const matchQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      item.audience.toLowerCase().includes(query.trim().toLowerCase());
    return matchPlatform && matchStatus && matchQuery;
  });

  const optimalSlots = OPTIMAL_SLOTS_BY_AUDIENCE[slotAudience];

  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Jadwal Publikasi Konten
          </h1>
          <p className="text-sm text-slate-600">
            Antrean konten terjadwal dan rekomendasi jam tayang berdasarkan perilaku audiens.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Total Item: <strong className="text-slate-900">{items.length}</strong>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {PLATFORM_FILTERS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatformFilter(plat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  platformFilter === plat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {[
              { id: 'semua', label: 'Semua Status' },
              { id: 'scheduled', label: 'Terjadwal' },
              { id: 'published', label: 'Tayang' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  setStatusFilter(st.id as 'semua' | 'scheduled' | 'published')
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Cari jadwal konten"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul atau audiens..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </section>

      {/* Main Split: Queue List + Optimal Timing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Antrean Konten &amp; Status Publikasi
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredItems.length} ditampilkan
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  Belum ada jadwal yang sesuai filter
                </p>
                <p className="text-xs text-slate-500">
                  Ubah filter platform/status atau buat ide konten baru untuk dijadwalkan.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                + Buat Konten Baru
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isPublished = item.status === 'published';
                return (
                  <li
                    key={item.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <MediaThumb
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-12"
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                          <span className="font-mono tabular-nums">
                            Iterasi #{item.iteration}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.audience}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.platforms.join(', ')}</span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          <span>{item.optimalSlot}</span>
                          <span aria-hidden="true">·</span>
                          <span>Promosi: {item.promotions.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          isPublished ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isPublished ? 'Dipublikasikan' : 'Terjadwal'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleItemStatus(item.id)}
                        className="px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors whitespace-nowrap"
                      >
                        {isPublished ? 'Tandai Terjadwal' : 'Tandai Tayang'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recommended Optimal Windows */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Jam Tayang Optimal per Audiens
            </h2>
            <p className="text-xs text-slate-500">
              Rekomendasi slot publikasi untuk memaksimalkan interaksi awal.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
            {AUDIENCE_SEGMENTS.map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setSlotAudience(aud)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  slotAudience === aud
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {aud}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {optimalSlots.map((slot) => (
              <div key={slot.id} className="py-3 first:pt-1 last:pb-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                    {slot.label}
                  </span>
                  <span className="text-xs font-semibold font-mono tabular-nums text-emerald-700">
                    {slot.upliftLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {slot.reason}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
