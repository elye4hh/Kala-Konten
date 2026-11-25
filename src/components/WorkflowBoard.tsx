import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
} from 'lucide-react';
import {
  PROMOTION_OPTIONS,
  TREND_TOPICS,
} from '../lib/seedData';
import {
  AudienceSegment,
  ContentCycleItem,
  Platform,
  TrendTopic,
  WorkflowStage,
} from '../lib/types';
import {
  countCheckedChecklistItems,
  filterTrendTopics,
  getOptimalSlotsForAudience,
  projectCycleMetrics,
} from '../lib/workflow';
import { MediaThumb } from './MediaThumb';

interface WorkflowBoardProps {
  draft: ContentCycleItem;
  feedbackMessage: string | null;
  onDismissFeedback: () => void;
  onChangeAudience: (audience: AudienceSegment) => void;
  onSelectTrendTopic: (topic: TrendTopic) => void;
  onUpdateDraftTitle: (title: string) => void;
  onUpdateHookText: (hookText: string) => void;
  onToggleCaptionReady: () => void;
  onTopicDecision: (approved: boolean) => void;
  onToggleChecklistItem: (id: string) => void;
  onQualityDecision: (approved: boolean, revisionNote?: string) => void;
  onSelectOptimalSlot: (slotLabel: string) => void;
  onTogglePlatform: (platform: Platform) => void;
  onTogglePromotion: (promo: string) => void;
  onToggleStatus: (status: 'scheduled' | 'published') => void;
  onCompleteCycle: () => void;
  onFocusStage: (stage: WorkflowStage) => void;
}

const AUDIENCES: AudienceSegment[] = ['Gen Z', 'Mahasiswa', 'Umum'];
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube Shorts'];

const STAGE_META: { id: WorkflowStage; badge: string; short: string; caption: string }[] = [
  {
    id: 'A',
    badge: 'A',
    short: 'Riset & Relevansi',
    caption: 'Fokus Analisis Audiens/Tren & Ubah Ide',
  },
  {
    id: 'B',
    badge: 'B',
    short: 'Produksi & Revisi',
    caption: 'Fokus Pembuatan, Review & Uji Kualitas',
  },
  {
    id: 'C',
    badge: 'C',
    short: 'Eksekusi & Evaluasi',
    caption: 'Fokus Jadwal, Publikasi, Promosi & Kinerja',
  },
];

export function WorkflowBoard({
  draft,
  feedbackMessage,
  onDismissFeedback,
  onChangeAudience,
  onSelectTrendTopic,
  onUpdateDraftTitle,
  onUpdateHookText,
  onToggleCaptionReady,
  onTopicDecision,
  onToggleChecklistItem,
  onQualityDecision,
  onSelectOptimalSlot,
  onTogglePlatform,
  onTogglePromotion,
  onToggleStatus,
  onCompleteCycle,
  onFocusStage,
}: WorkflowBoardProps) {
  const [trendQuery, setTrendQuery] = useState('');
  const [revisionInput, setRevisionInput] = useState('');
  const [mobileStage, setMobileStage] = useState<WorkflowStage>(draft.activeStage);

  useEffect(() => {
    setMobileStage(draft.activeStage);
  }, [draft.activeStage]);

  const filteredTopics = filterTrendTopics(TREND_TOPICS, draft.audience, trendQuery);
  const recommendedSlots = getOptimalSlotsForAudience(draft.audience);
  const checkedCount = countCheckedChecklistItems(draft.checklist);
  const projectedMetrics = projectCycleMetrics(draft);

  const currentStage = draft.activeStage;

  const handleStageSwitch = (stage: WorkflowStage) => {
    setMobileStage(stage);
    onFocusStage(stage);
  };

  const handleTopicApprove = () => {
    onTopicDecision(true);
    setMobileStage('B');
  };

  const handleQualityApprove = () => {
    onQualityDecision(true);
    setMobileStage('C');
  };

  const handleQualityRevise = () => {
    onQualityDecision(false, revisionInput);
    setRevisionInput('');
  };

  const handleFinishCycle = () => {
    onCompleteCycle();
    setMobileStage('A');
  };

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Alur Penjadwalan Konten Optimal
          </h1>
          <p className="text-sm text-slate-600">
            Siklus iteratif 3 tahap berdasarkan Flowchart Elia, Qonita &amp; Qurrota.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono tabular-nums">
          <span className="font-semibold text-slate-900">
            Iterasi #{draft.iteration}
          </span>
          <span aria-hidden="true">·</span>
          <span>Tahap Aktif: {currentStage}</span>
          <span aria-hidden="true">·</span>
          <span>{draft.updatedAt}</span>
        </div>
      </section>

      {/* Iterative Flow Feedback Notice */}
      {feedbackMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950"
        >
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={onDismissFeedback}
            className="text-xs font-semibold text-blue-800 hover:text-blue-950 whitespace-nowrap px-2 py-1 rounded"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Mobile Stage Switcher (matches 3 screens A / B / C cleanly without cramping) */}
      <div
        role="tablist"
        aria-label="Pilih Tahap Alur Kerja"
        className="lg:hidden grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl"
      >
        {STAGE_META.map((stage) => {
          const isMobileActive = mobileStage === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isMobileActive}
              onClick={() => handleStageSwitch(stage.id)}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isMobileActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {stage.badge}. {stage.short.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* 3-Column Interactive Flowchart Board (Screens A, B, C) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* ======================== LAYAR A ======================== */}
        <article
          data-testid="stage-card-A"
          className={`${
            mobileStage === 'A' ? 'flex' : 'hidden lg:flex'
          } flex-col justify-between bg-white rounded-2xl border transition-colors ${
            currentStage === 'A'
              ? 'border-blue-600 ring-1 ring-blue-600/15'
              : 'border-slate-200'
          }`}
        >
          <div>
            {/* Stage Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    currentStage === 'A'
                      ? 'bg-slate-900 text-white'
                      : draft.topicApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  A
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    Analisis &amp; Relevansi Topik
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    Alternatif A: Riset &amp; Relevansi
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                {draft.topicApproved ? 'Disetujui' : 'Aktif'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 1: Analisis Audiens dan Tren */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">
                  1. Analisis Audiens dan Tren
                </h3>

                <div>
                  <span className="block text-xs text-slate-500 mb-2">
                    Pilih Target Audiens:
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                    {AUDIENCES.map((aud) => {
                      const active = draft.audience === aud;
                      return (
                        <button
                          key={aud}
                          type="button"
                          onClick={() => onChangeAudience(aud)}
                          className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap min-h-[36px] ${
                            active
                              ? 'bg-white text-slate-900 shadow-xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {aud}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="trend-search" className="sr-only">
                    Cari tren dan topik populer
                  </label>
                  <div className="relative">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="trend-search"
                      type="text"
                      value={trendQuery}
                      onChange={(e) => setTrendQuery(e.target.value)}
                      placeholder="Cari tren & topik populer..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Matching Trend Suggestions */}
                <div className="space-y-1.5">
                  {filteredTopics.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      Tidak ada tren yang cocok dengan &ldquo;{trendQuery}&rdquo;.
                    </p>
                  ) : (
                    filteredTopics.slice(0, 2).map((topic) => {
                      const isSelected =
                        draft.title.toLowerCase() === topic.title.toLowerCase();
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => onSelectTrendTopic(topic)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 leading-snug">
                              {topic.title}
                            </span>
                            <span className="text-xs font-mono tabular-nums font-semibold text-blue-700 shrink-0">
                              {topic.baseScore}%
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{topic.format}</span>
                            <span aria-hidden="true">·</span>
                            <span>{topic.trendMomentum}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Step 2: Apakah Topik Relevan? */}
              <section className="pt-4 border-t border-slate-100">
                <div className="rounded-xl bg-slate-50 p-3.5 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 text-center">
                    2. Apakah Topik Relevan?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleTopicApprove}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Ya → Buat Konten</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTopicDecision(false)}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Tidak → Ubah Ide</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Status Ide Topik */}
              <section className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    Status Ide Topik
                  </h3>
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-700">
                    Skor Relevansi: {draft.relevanceScore}%
                  </span>
                </div>

                <label htmlFor="active-topic-input" className="sr-only">
                  Topik konten aktif
                </label>
                <input
                  id="active-topic-input"
                  type="text"
                  value={draft.title}
                  onChange={(e) => onUpdateDraftTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                />

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  <span>
                    {draft.relevanceScore >= 80 ? 'Siap Produksi' : 'Perlu Penajaman'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Audiens: {draft.audience}</span>
                  {draft.ideaChangeCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Ubah ide: {draft.ideaChangeCount}x
                      </span>
                    </>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tahap 1 dari 3</span>
            <button
              type="button"
              onClick={() => handleStageSwitch('B')}
              className="lg:hidden inline-flex items-center gap-1 font-semibold text-blue-700"
            >
              <span>Lanjut ke Tahap B</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </article>

        {/* ======================== LAYAR B ======================== */}
        <article
          data-testid="stage-card-B"
          className={`${
            mobileStage === 'B' ? 'flex' : 'hidden lg:flex'
          } flex-col justify-between bg-white rounded-2xl border transition-colors ${
            currentStage === 'B'
              ? 'border-blue-600 ring-1 ring-blue-600/15'
              : 'border-slate-200'
          }`}
        >
          <div>
            {/* Stage Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    currentStage === 'B'
                      ? 'bg-slate-900 text-white'
                      : draft.qualityApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  B
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    Produksi, Review &amp; Uji Kualitas
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    Alternatif B: Produksi &amp; Revisi
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                {draft.qualityApproved
                  ? 'Lolos Uji'
                  : draft.topicApproved
                    ? 'Produksi'
                    : 'Menunggu A'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 3: Pembuatan Konten */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900">
                  3. Pembuatan Konten
                </h3>

                <div className="flex items-start gap-3">
                  <MediaThumb
                    src={draft.thumbnail}
                    alt={`Preview visual ${draft.title}`}
                    className="w-16 h-14"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {draft.format}: {draft.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        Caption &amp; Hook:{' '}
                        <strong className="text-slate-700">
                          {draft.captionReady ? 'Selesai' : 'Draf'}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={onToggleCaptionReady}
                        className="text-blue-700 hover:underline font-medium"
                      >
                        Ubah status
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="draft-hook-input"
                    className="block text-[11px] text-slate-500 mb-1"
                  >
                    Hook 3 Detik Pertama
                  </label>
                  <input
                    id="draft-hook-input"
                    type="text"
                    value={draft.hookText}
                    onChange={(e) => onUpdateHookText(e.target.value)}
                    placeholder="Tulis hook pembuka..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </section>

              {/* Step 4: Review Konten */}
              <section className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    4. Review Konten
                  </h3>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {checkedCount}/{draft.checklist.length} selesai
                  </span>
                </div>

                <ul className="space-y-1">
                  {draft.checklist.map((item) => (
                    <li key={item.id}>
                      <label className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => onToggleChecklistItem(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span
                          className={`text-xs ${
                            item.checked
                              ? 'text-slate-900 font-medium'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Step 5: Uji Kualitas */}
              <section className="pt-4 border-t border-slate-100 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3.5 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 text-center">
                    5. Uji Kualitas
                  </h3>

                  <label htmlFor="revision-note-input" className="sr-only">
                    Catatan revisi konten
                  </label>
                  <input
                    id="revision-note-input"
                    type="text"
                    value={revisionInput}
                    onChange={(e) => setRevisionInput(e.target.value)}
                    placeholder="Catatan revisi (opsional)..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleQualityApprove}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Ya → Jadwal Konten</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleQualityRevise}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Tidak → Revisi</span>
                    </button>
                  </div>
                </div>

                {draft.revisionNotes.length > 0 && (
                  <div className="text-[11px] text-rose-800 bg-rose-50/70 border border-rose-200 rounded-lg px-3 py-2 space-y-1">
                    <div className="font-semibold font-mono tabular-nums">
                      Catatan Revisi ({draft.revisionCount}x):
                    </div>
                    <p className="text-rose-900 leading-snug">
                      {draft.revisionNotes[0]}
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tahap 2 dari 3</span>
            <button
              type="button"
              onClick={() => handleStageSwitch('C')}
              className="lg:hidden inline-flex items-center gap-1 font-semibold text-blue-700"
            >
              <span>Lanjut ke Tahap C</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </article>

        {/* ======================== LAYAR C ======================== */}
        <article
          data-testid="stage-card-C"
          className={`${
            mobileStage === 'C' ? 'flex' : 'hidden lg:flex'
          } flex-col justify-between bg-white rounded-2xl border transition-colors ${
            currentStage === 'C'
              ? 'border-blue-600 ring-1 ring-blue-600/15'
              : 'border-slate-200'
          }`}
        >
          <div>
            {/* Stage Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    currentStage === 'C'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  C
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    Jadwal, Publikasi &amp; Analisis
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    Alternatif C: Eksekusi &amp; Evaluasi
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                {draft.status === 'published'
                  ? 'Tayang'
                  : draft.qualityApproved
                    ? 'Siap Jadwal'
                    : 'Menunggu B'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Step 6: Jadwal Konten Optimal */}
              <section className="rounded-xl bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                    <span>6. Jadwal Konten Optimal</span>
                  </h3>
                </div>

                <label htmlFor="optimal-slot-select" className="sr-only">
                  Pilih waktu tayang optimal
                </label>
                <select
                  id="optimal-slot-select"
                  value={draft.optimalSlot}
                  onChange={(e) => onSelectOptimalSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {recommendedSlots.map((slot) => (
                    <option key={slot.id} value={slot.label}>
                      {slot.label} ({slot.upliftLabel})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-600">
                  Waktu Terbaik:{' '}
                  <strong className="text-slate-900 font-mono tabular-nums">
                    {draft.optimalSlot}
                  </strong>
                </p>
              </section>

              {/* Step 7 & 8: Publikasi & Promosi Konten */}
              <section className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    7. Publikasi &amp; 8. Promosi Konten
                  </h3>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onToggleStatus('scheduled')}
                      className={`px-2 py-1 rounded-md font-medium transition-colors ${
                        draft.status !== 'published'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Terjadwal
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus('published')}
                      className={`px-2 py-1 rounded-md font-medium transition-colors ${
                        draft.status === 'published'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Tayang
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5">
                    Kanal Publikasi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map((platform) => {
                      const selected = draft.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => onTogglePlatform(platform)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                            selected
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5">
                    Strategi Promosi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMOTION_OPTIONS.map((promo) => {
                      const active = draft.promotions.includes(promo);
                      return (
                        <button
                          key={promo}
                          type="button"
                          onClick={() => onTogglePromotion(promo)}
                          className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors whitespace-nowrap ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {promo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Step 9: Analisis Kinerja Konten */}
              <section className="pt-4 border-t border-slate-100 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900">
                  9. Analisis Kinerja Konten
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                    <div className="text-[11px] text-slate-500">Proyeksi Views</div>
                    <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {(projectedMetrics.views / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-2.5">
                    <div className="text-[11px] text-slate-500">Engagement</div>
                    <div className="text-base font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
                      +{projectedMetrics.engagementRate}%
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono tabular-nums">
                  <span>Estimasi Simpanan: {projectedMetrics.saves}</span>
                  <span aria-hidden="true">·</span>
                  <span>Bagikan: {projectedMetrics.shares}</span>
                </div>
              </section>
            </div>
          </div>

          <div className="p-5 pt-2">
            <button
              type="button"
              onClick={handleFinishCycle}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Selesai (Mulai Iterasi Baru)</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
