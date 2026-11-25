import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AudienceSegment, ContentFormat, Platform } from '../lib/types';
import { THUMBNAILS } from '../lib/seedData';

interface NewContentModalProps {
  isOpen: boolean;
  nextIteration: number;
  defaultAudience: AudienceSegment;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    audience: AudienceSegment;
    format: ContentFormat;
    platforms: Platform[];
    hookText: string;
    thumbnail: string;
  }) => void;
}

const AUDIENCE_OPTIONS: AudienceSegment[] = ['Gen Z', 'Mahasiswa', 'Umum'];
const FORMAT_OPTIONS: ContentFormat[] = ['Reels', 'Carousel', 'TikTok Video', 'Shorts'];
const PLATFORM_OPTIONS: Platform[] = ['Instagram', 'TikTok', 'YouTube Shorts'];
const THUMB_CHOICES = [
  { label: 'Meja Planner', url: THUMBNAILS.timeManagement },
  { label: 'Ruang Belajar', url: THUMBNAILS.studySetup },
  { label: 'Studio Kreator', url: THUMBNAILS.creatorStudio },
];

export function NewContentModal({
  isOpen,
  nextIteration,
  defaultAudience,
  onClose,
  onCreate,
}: NewContentModalProps) {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState<AudienceSegment>(defaultAudience);
  const [format, setFormat] = useState<ContentFormat>('Reels');
  const [platforms, setPlatforms] = useState<Platform[]>(['Instagram', 'TikTok']);
  const [hookText, setHookText] = useState('');
  const [thumbnail, setThumbnail] = useState<string>(THUMBNAILS.timeManagement);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAudience(defaultAudience);
      setFormat('Reels');
      setPlatforms(['Instagram', 'TikTok']);
      setHookText('');
      setThumbnail(THUMBNAILS.timeManagement);
      setErrorMsg('');
    }
  }, [isOpen, defaultAudience]);

  if (!isOpen) return null;

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.length > 1
          ? prev.filter((p) => p !== platform)
          : prev
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      setErrorMsg('Judul topik minimal 5 karakter agar skor relevansi dapat dihitung.');
      return;
    }
    onCreate({
      title: title.trim(),
      audience,
      format,
      platforms,
      hookText: hookText.trim(),
      thumbnail,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-new-content-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2
              id="modal-new-content-title"
              className="text-base font-bold text-slate-900"
            >
              Mulai Ide Konten Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
              Siklus Iterasi #{nextIteration} · Masuk ke Tahap A
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir konten baru"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label
              htmlFor="new-topic-title"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Judul Topik Konten
            </label>
            <input
              id="new-topic-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Contoh: Cara Mengatur Jadwal Belajar Sebelum UTS"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
            {errorMsg && (
              <p className="mt-1.5 text-xs text-rose-700 font-medium" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audiens
              </span>
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
                {AUDIENCE_OPTIONS.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setAudience(aud)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      audience === aud
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="new-topic-format"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Format Konten
              </label>
              <select
                id="new-topic-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {FORMAT_OPTIONS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Platform Publikasi Target
            </span>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((plat) => {
                const selected = platforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      selected
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {plat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="new-topic-hook"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Hook Pembuka (Opsional)
            </label>
            <input
              id="new-topic-hook"
              type="text"
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="Kalimat pembuka 3 detik pertama..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Referensi Visual
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {THUMB_CHOICES.map((thumb) => {
                const active = thumbnail === thumb.url;
                return (
                  <button
                    key={thumb.label}
                    type="button"
                    onClick={() => setThumbnail(thumb.url)}
                    className={`text-left p-1.5 rounded-lg border transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={thumb.url}
                      alt={thumb.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-14 object-cover rounded mb-1"
                    />
                    <span className="block text-[11px] font-medium text-slate-700 truncate">
                      {thumb.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[40px] text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 min-h-[40px] text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Simpan ke Tahap A
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
