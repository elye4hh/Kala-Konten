import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { NewContentModal } from './components/NewContentModal';
import { ProfileView } from './components/ProfileView';
import { ScheduleView } from './components/ScheduleView';
import { TopBar } from './components/TopBar';
import { WorkflowBoard } from './components/WorkflowBoard';
import { AnalyticsView } from './components/AnalyticsView';
import {
  INITIAL_ACTIVE_DRAFT,
  INITIAL_COMPLETED_HISTORY,
  INITIAL_PREFERENCES,
} from './lib/seedData';
import {
  AudienceSegment,
  ContentCycleItem,
  ContentFormat,
  NavTab,
  Platform,
  TrendTopic,
  WorkflowStage,
  WorkspacePreferences,
} from './lib/types';
import {
  advanceQualityDecision,
  advanceTopicDecision,
  calculateRelevanceScore,
  completeIterationCycle,
  createNewDraftItem,
  getOptimalSlotsForAudience,
} from './lib/workflow';

const STORAGE_KEY = 'penjadwalan_konten_state_v1';

interface PersistedState {
  activeDraft: ContentCycleItem;
  completedHistory: ContentCycleItem[];
  preferences: WorkspacePreferences;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activeDraft: INITIAL_ACTIVE_DRAFT,
        completedHistory: INITIAL_COMPLETED_HISTORY,
        preferences: INITIAL_PREFERENCES,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (
      parsed.activeDraft &&
      Array.isArray(parsed.completedHistory) &&
      parsed.preferences
    ) {
      return {
        activeDraft: parsed.activeDraft,
        completedHistory: parsed.completedHistory,
        preferences: parsed.preferences,
      };
    }
  } catch {
    // Ignore corrupt localStorage and fall back to seed data
  }
  return {
    activeDraft: INITIAL_ACTIVE_DRAFT,
    completedHistory: INITIAL_COMPLETED_HISTORY,
    preferences: INITIAL_PREFERENCES,
  };
}

export default function App() {
  const initial = loadInitialState();

  const [activeDraft, setActiveDraft] = useState<ContentCycleItem>(
    initial.activeDraft
  );
  const [completedHistory, setCompletedHistory] = useState<ContentCycleItem[]>(
    initial.completedHistory
  );
  const [preferences, setPreferences] = useState<WorkspacePreferences>(
    initial.preferences
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        activeDraft,
        completedHistory,
        preferences,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted browsers
    }
  }, [activeDraft, completedHistory, preferences]);

  const handleChangeAudience = (audience: AudienceSegment) => {
    const slots = getOptimalSlotsForAudience(audience);
    setActiveDraft((prev) => ({
      ...prev,
      audience,
      relevanceScore: calculateRelevanceScore(prev.title, audience, 84),
      optimalSlot: slots[0].label,
      updatedAt: 'Audiens diperbarui',
    }));
  };

  const handleSelectTrendTopic = (topic: TrendTopic) => {
    setActiveDraft((prev) => ({
      ...prev,
      title: topic.title,
      audience: topic.audience,
      format: topic.format,
      hookText: topic.hookHint,
      thumbnail: topic.thumbnail,
      relevanceScore: topic.baseScore,
      topicApproved: false,
      activeStage: 'A',
      updatedAt: 'Topik tren dipilih',
    }));
  };

  const handleUpdateDraftTitle = (title: string) => {
    setActiveDraft((prev) => ({
      ...prev,
      title,
      relevanceScore: calculateRelevanceScore(title, prev.audience, 84),
      updatedAt: 'Judul disunting',
    }));
  };

  const handleUpdateHookText = (hookText: string) => {
    setActiveDraft((prev) => ({
      ...prev,
      hookText,
      captionReady: hookText.trim().length > 5,
    }));
  };

  const handleToggleCaptionReady = () => {
    setActiveDraft((prev) => ({
      ...prev,
      captionReady: !prev.captionReady,
    }));
  };

  const handleTopicDecision = (approved: boolean) => {
    setActiveDraft((prev) => {
      const updated = advanceTopicDecision(prev, approved);
      setFeedbackMessage(
        approved
          ? 'Topik dinilai relevan. Lanjut ke Tahap B untuk produksi dan review kualitas.'
          : `Ide topik diperbarui (perubahan ke-${updated.ideaChangeCount}). Tinjau ulang kecocokan audiens di Tahap A.`
      );
      return updated;
    });
  };

  const handleToggleChecklistItem = (id: string) => {
    setActiveDraft((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleQualityDecision = (approved: boolean, revisionNote?: string) => {
    setActiveDraft((prev) => {
      const updated = advanceQualityDecision(prev, approved, revisionNote);
      setFeedbackMessage(
        approved
          ? 'Konten lolos uji kualitas. Lanjut ke Tahap C untuk penjadwalan dan promosi.'
          : `Revisi #${updated.revisionCount} dicatat. Perbaiki draf di Tahap B sebelum dijadwalkan.`
      );
      return updated;
    });
  };

  const handleSelectOptimalSlot = (slotLabel: string) => {
    setActiveDraft((prev) => ({
      ...prev,
      optimalSlot: slotLabel,
      updatedAt: 'Jadwal diperbarui',
    }));
  };

  const handleTogglePlatform = (platform: Platform) => {
    setActiveDraft((prev) => {
      const exists = prev.platforms.includes(platform);
      const next = exists
        ? prev.platforms.length > 1
          ? prev.platforms.filter((p) => p !== platform)
          : prev.platforms
        : [...prev.platforms, platform];
      return { ...prev, platforms: next };
    });
  };

  const handleTogglePromotion = (promo: string) => {
    setActiveDraft((prev) => {
      const exists = prev.promotions.includes(promo);
      const next = exists
        ? prev.promotions.filter((p) => p !== promo)
        : [...prev.promotions, promo];
      return { ...prev, promotions: next };
    });
  };

  const handleToggleDraftStatus = (status: 'scheduled' | 'published') => {
    setActiveDraft((prev) => ({
      ...prev,
      status,
      updatedAt: status === 'published' ? 'Dipublikasikan' : 'Terjadwal',
    }));
  };

  const handleCompleteCycle = () => {
    const { completedItem, nextDraft } = completeIterationCycle(activeDraft);
    setCompletedHistory((prev) => [...prev, completedItem]);
    setActiveDraft(nextDraft);
    setFeedbackMessage(
      `Iterasi #${completedItem.iteration} selesai dan masuk ke Jadwal & Analitik. Iterasi #${nextDraft.iteration} dimulai di Tahap A.`
    );
  };

  const handleFocusStage = (stage: WorkflowStage) => {
    setActiveDraft((prev) => ({
      ...prev,
      activeStage: stage,
    }));
  };

  const handleCreateNewContent = (payload: {
    title: string;
    audience: AudienceSegment;
    format: ContentFormat;
    platforms: Platform[];
    hookText: string;
    thumbnail: string;
  }) => {
    const created = createNewDraftItem({
      iteration: activeDraft.iteration,
      title: payload.title,
      audience: payload.audience,
      format: payload.format,
      platforms: payload.platforms,
      hookText: payload.hookText,
      thumbnail: payload.thumbnail,
    });
    setActiveDraft(created);
    setIsNewModalOpen(false);
    setActiveTab('home');
    setFeedbackMessage(
      `Ide baru "${created.title}" siap dianalisis pada Tahap A.`
    );
  };

  const handleToggleScheduleItemStatus = (id: string) => {
    setCompletedHistory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'published' ? 'scheduled' : 'published',
            }
          : item
      )
    );
  };

  const handleResetDemoData = () => {
    setActiveDraft(INITIAL_ACTIVE_DRAFT);
    setCompletedHistory(INITIAL_COMPLETED_HISTORY);
    setPreferences(INITIAL_PREFERENCES);
    setFeedbackMessage('Data simulasi dikembalikan ke kondisi awal.');
    setActiveTab('home');
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scheduleQueueItems =
    activeDraft.qualityApproved || activeDraft.activeStage === 'C'
      ? [activeDraft, ...completedHistory]
      : completedHistory;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewModal={() => setIsNewModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <WorkflowBoard
            draft={activeDraft}
            feedbackMessage={feedbackMessage}
            onDismissFeedback={() => setFeedbackMessage(null)}
            onChangeAudience={handleChangeAudience}
            onSelectTrendTopic={handleSelectTrendTopic}
            onUpdateDraftTitle={handleUpdateDraftTitle}
            onUpdateHookText={handleUpdateHookText}
            onToggleCaptionReady={handleToggleCaptionReady}
            onTopicDecision={handleTopicDecision}
            onToggleChecklistItem={handleToggleChecklistItem}
            onQualityDecision={handleQualityDecision}
            onSelectOptimalSlot={handleSelectOptimalSlot}
            onTogglePlatform={handleTogglePlatform}
            onTogglePromotion={handleTogglePromotion}
            onToggleStatus={handleToggleDraftStatus}
            onCompleteCycle={handleCompleteCycle}
            onFocusStage={handleFocusStage}
          />
        )}

        {activeTab === 'jadwal' && (
          <ScheduleView
            items={scheduleQueueItems}
            onToggleItemStatus={handleToggleScheduleItemStatus}
            onOpenNewModal={() => setIsNewModalOpen(true)}
          />
        )}

        {activeTab === 'analitik' && (
          <AnalyticsView
            history={completedHistory}
            onGoToWorkflow={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'profil' && (
          <ProfileView
            preferences={preferences}
            completedCount={completedHistory.length}
            currentIteration={activeDraft.iteration}
            onUpdatePreferences={setPreferences}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>Penjadwalan Konten Optimal · Alur Kerja Elia, Qonita &amp; Qurrota</span>
          <span className="font-mono tabular-nums">
            Siklus Iterasi #{activeDraft.iteration}
          </span>
        </div>
      </footer>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewModal={() => setIsNewModalOpen(true)}
      />

      <NewContentModal
        isOpen={isNewModalOpen}
        nextIteration={activeDraft.iteration}
        defaultAudience={preferences.defaultAudience}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateNewContent}
      />
    </div>
  );
}
