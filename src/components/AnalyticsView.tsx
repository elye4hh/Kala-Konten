import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { ContentCycleItem } from '../lib/types';
import { computeAnalyticsSummary } from '../lib/workflow';

interface AnalyticsViewProps {
  history: ContentCycleItem[];
  onGoToWorkflow: () => void;
}

export function AnalyticsView({ history, onGoToWorkflow }: AnalyticsViewProps) {
  const summary = computeAnalyticsSummary(history);
  const sorted = [...history].sort((a, b) => a.iteration - b.iteration);
  const [hoveredId, setHoveredId] = useState<string | null>(
    sorted.length > 0 ? sorted[sorted.length - 1].id : null
  );

  const maxViews = Math.max(...sorted.map((item) => item.metrics.views), 10000);
  const activeBarItem = sorted.find((item) => item.id === hoveredId) ?? sorted[sorted.length - 1];

  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Analisis Kinerja Konten
          </h1>
          <p className="text-sm text-slate-600">
            Evaluasi hasil publikasi dan pertumbuhan performa antar siklus iteratif.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Segmen Paling Responsif:{' '}
          <strong className="text-slate-900">{summary.topAudience}</strong>
        </div>
      </section>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BarChart3 className="w-9 h-9 text-slate-300 mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Belum ada siklus yang selesai
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Selesaikan minimal satu siklus konten di Alur Kerja untuk melihat perbandingan views, engagement, dan efektivitas jam tayang.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToWorkflow}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Buka Alur Kerja
          </button>
        </div>
      ) : (
        <>
          {/* Summary Strip (clean grid with hairline dividers, no nested cards) */}
          <section className="bg-white rounded-2xl border border-slate-200 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="p-5 space-y-1">
              <div className="text-xs text-slate-500">Total Siklus Selesai</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {summary.totalCycles}
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-xs text-slate-500">Total Tayangan (Views)</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {summary.totalViews.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-xs text-slate-500">Rata-rata Engagement</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
                +{summary.avgEngagementRate}%
              </div>
            </div>
            <div className="p-5 space-y-1">
              <div className="text-xs text-slate-500">Total Simpanan (Saves)</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {summary.totalSaves.toLocaleString('id-ID')}
              </div>
            </div>
          </section>

          {/* Iteration Chart */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Grafik Kinerja per Siklus Iterasi
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih batang iterasi untuk melihat rincian tayangan dan rasio interaksi.
                </p>
              </div>
              {activeBarItem && (
                <div className="text-xs text-slate-600 font-mono tabular-nums">
                  <strong className="text-slate-900">
                    Iterasi #{activeBarItem.iteration}
                  </strong>{' '}
                  · {activeBarItem.metrics.views.toLocaleString('id-ID')} views · +
                  {activeBarItem.metrics.engagementRate}% engagement
                </div>
              )}
            </div>

            <div
              className="grid gap-4 items-end pt-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(Math.max(sorted.length, 2), 6)}, minmax(0, 1fr))`,
              }}
            >
              {sorted.map((item) => {
                const heightPct = Math.max(
                  14,
                  Math.round((item.metrics.views / maxViews) * 140)
                );
                const isSelected = activeBarItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHoveredId(item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-colors text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-700">
                      {(item.metrics.views / 1000).toFixed(1)}K
                    </span>
                    <div className="w-full h-36 flex items-end justify-center">
                      <div
                        style={{ height: `${heightPct}px` }}
                        className={`w-10 rounded-t-md transition-all ${
                          isSelected ? 'bg-blue-700' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-xs font-semibold font-mono tabular-nums text-slate-900">
                        #{item.iteration}
                      </span>
                      <span className="block text-[11px] font-mono tabular-nums text-emerald-700">
                        +{item.metrics.engagementRate}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Ledger Table */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Riwayat Evaluasi Siklus Konten
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Total Revisi: {summary.totalRevisions}x
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4">Siklus</th>
                    <th className="py-3 px-4">Topik Konten</th>
                    <th className="py-3 px-4">Audiens</th>
                    <th className="py-3 px-4">Jadwal Tayang</th>
                    <th className="py-3 px-4 text-right">Revisi</th>
                    <th className="py-3 px-4 text-right">Views</th>
                    <th className="py-3 px-4 text-right">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sorted.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900">
                        #{item.iteration}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.audience}</td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {item.optimalSlot}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-600">
                        {item.revisionCount}x
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-slate-900">
                        {item.metrics.views.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right font-semibold text-emerald-700">
                        +{item.metrics.engagementRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
