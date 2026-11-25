import {
  DEFAULT_CHECKLIST,
  OPTIMAL_SLOTS_BY_AUDIENCE,
  TREND_TOPICS,
} from './seedData';
import {
  AudienceSegment,
  ChecklistItem,
  ContentCycleItem,
  ContentFormat,
  OptimalSlot,
  Platform,
  TrendTopic,
} from './types';

export function filterTrendTopics(
  topics: TrendTopic[],
  audience: AudienceSegment | 'Semua',
  query: string
): TrendTopic[] {
  const normalized = query.trim().toLowerCase();
  return topics.filter((topic) => {
    const audienceMatch = audience === 'Semua' || topic.audience === audience;
    if (!audienceMatch) return false;
    if (!normalized) return true;
    return (
      topic.title.toLowerCase().includes(normalized) ||
      topic.hookHint.toLowerCase().includes(normalized) ||
      topic.format.toLowerCase().includes(normalized)
    );
  });
}

export function calculateRelevanceScore(
  title: string,
  audience: AudienceSegment,
  baseScore = 82
): number {
  const clean = title.trim().toLowerCase();
  if (!clean) return 55;

  let score = baseScore;
  const audienceKeywords: Record<AudienceSegment, string[]> = {
    'Gen Z': ['gen z', 'burnout', 'pagi', 'notion', 'tiktok', 'reels', 'estetik', 'scroll', 'tips'],
    Mahasiswa: ['kuliah', 'skripsi', 'tugas', 'kampus', 'organisasi', 'belajar', 'ujian', 'waktu'],
    Umum: ['budget', 'gaji', 'kerja', 'meja', 'produktif', 'harian', 'keluarga', 'keuangan'],
  };

  const matched = audienceKeywords[audience].filter((kw) => clean.includes(kw)).length;
  score += Math.min(matched * 3, 9);

  if (clean.length >= 18 && clean.length <= 65) {
    score += 3;
  } else if (clean.length < 10) {
    score -= 10;
  }

  return Math.max(58, Math.min(98, score));
}

export function getOptimalSlotsForAudience(audience: AudienceSegment): OptimalSlot[] {
  return OPTIMAL_SLOTS_BY_AUDIENCE[audience] ?? OPTIMAL_SLOTS_BY_AUDIENCE['Gen Z'];
}

export function areAllChecklistItemsChecked(checklist: ChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((item) => item.checked);
}

export function countCheckedChecklistItems(checklist: ChecklistItem[]): number {
  return checklist.filter((item) => item.checked).length;
}

export function advanceTopicDecision(
  item: ContentCycleItem,
  approved: boolean,
  alternativeTopic?: TrendTopic
): ContentCycleItem {
  if (approved) {
    const score = Math.max(item.relevanceScore, 75);
    return {
      ...item,
      relevanceScore: score,
      topicApproved: true,
      activeStage: 'B',
      updatedAt: 'Baru saja',
    };
  }

  const nextIdea =
    alternativeTopic ??
    TREND_TOPICS.find(
      (t) => t.audience === item.audience && t.title.toLowerCase() !== item.title.toLowerCase()
    ) ??
    TREND_TOPICS[0];

  const recalculated = calculateRelevanceScore(nextIdea.title, item.audience, nextIdea.baseScore);

  return {
    ...item,
    title: nextIdea.title,
    format: nextIdea.format,
    hookText: nextIdea.hookHint,
    thumbnail: nextIdea.thumbnail,
    relevanceScore: recalculated,
    topicApproved: false,
    qualityApproved: false,
    activeStage: 'A',
    ideaChangeCount: item.ideaChangeCount + 1,
    updatedAt: 'Ide diperbarui',
  };
}

export function advanceQualityDecision(
  item: ContentCycleItem,
  approved: boolean,
  revisionNote = 'Perlu penajaman hook 3 detik pertama dan cek CTA'
): ContentCycleItem {
  if (approved) {
    const completedChecklist = item.checklist.map((c) => ({ ...c, checked: true }));
    const slots = getOptimalSlotsForAudience(item.audience);
    const preferredSlot =
      slots.some((s) => s.label === item.optimalSlot) ? item.optimalSlot : slots[0].label;

    return {
      ...item,
      checklist: completedChecklist,
      qualityApproved: true,
      topicApproved: true,
      activeStage: 'C',
      optimalSlot: preferredSlot,
      status: item.status === 'published' ? 'published' : 'scheduled',
      updatedAt: 'Lolos uji kualitas',
    };
  }

  const trimmedNote = revisionNote.trim() || 'Perlu revisi konten sebelum dijadwalkan';
  return {
    ...item,
    qualityApproved: false,
    activeStage: 'B',
    revisionCount: item.revisionCount + 1,
    revisionNotes: [trimmedNote, ...item.revisionNotes],
    status: 'draft',
    updatedAt: `Revisi #${item.revisionCount + 1}`,
  };
}

export function projectCycleMetrics(item: ContentCycleItem): ContentCycleItem['metrics'] {
  const platformMultiplier = 1 + (item.platforms.length - 1) * 0.24;
  const promoMultiplier = 1 + item.promotions.length * 0.08;
  const qualityFactor = item.relevanceScore / 85;
  const baseViews = 9500;
  const views = Math.round((baseViews * platformMultiplier * promoMultiplier * qualityFactor) / 100) * 100;
  const engagementRate = Number(
    Math.min(18.5, 8.4 + item.promotions.length * 1.1 + (item.relevanceScore - 80) * 0.18).toFixed(1)
  );
  const saves = Math.round(views * 0.068);
  const shares = Math.round(views * 0.024);

  return {
    views,
    engagementRate,
    saves,
    shares,
  };
}

export function completeIterationCycle(
  item: ContentCycleItem,
  nextTopicPool: TrendTopic[] = TREND_TOPICS
): { completedItem: ContentCycleItem; nextDraft: ContentCycleItem } {
  const finalMetrics = projectCycleMetrics(item);
  const completedItem: ContentCycleItem = {
    ...item,
    topicApproved: true,
    qualityApproved: true,
    activeStage: 'C',
    status: item.status === 'published' ? 'published' : 'scheduled',
    metrics: finalMetrics,
    updatedAt: 'Selesai · Terjadwal',
  };

  const nextIteration = item.iteration + 1;
  const nextTopic =
    nextTopicPool.find((t) => t.title !== item.title) ?? nextTopicPool[0];
  const nextSlots = getOptimalSlotsForAudience(nextTopic.audience);

  const nextDraft: ContentCycleItem = {
    id: `cycle-active-${nextIteration}-${Date.now()}`,
    iteration: nextIteration,
    title: nextTopic.title,
    audience: nextTopic.audience,
    format: nextTopic.format,
    relevanceScore: nextTopic.baseScore,
    activeStage: 'A',
    topicApproved: false,
    ideaChangeCount: 0,
    hookText: nextTopic.hookHint,
    captionReady: false,
    thumbnail: nextTopic.thumbnail,
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, checked: false })),
    qualityApproved: false,
    revisionCount: 0,
    revisionNotes: [],
    optimalSlot: nextSlots[0].label,
    platforms: [...item.platforms],
    promotions: ['Repost Story'],
    status: 'draft',
    metrics: {
      views: 0,
      engagementRate: 0,
      saves: 0,
      shares: 0,
    },
    updatedAt: 'Iterasi baru dimulai',
  };

  return { completedItem, nextDraft };
}

export function createNewDraftItem(params: {
  iteration: number;
  title: string;
  audience: AudienceSegment;
  format: ContentFormat;
  platforms: Platform[];
  hookText?: string;
  thumbnail?: string;
}): ContentCycleItem {
  const slots = getOptimalSlotsForAudience(params.audience);
  const relevanceScore = calculateRelevanceScore(params.title, params.audience, 84);

  return {
    id: `cycle-custom-${params.iteration}-${Date.now()}`,
    iteration: params.iteration,
    title: params.title.trim(),
    audience: params.audience,
    format: params.format,
    relevanceScore,
    activeStage: 'A',
    topicApproved: false,
    ideaChangeCount: 0,
    hookText:
      params.hookText?.trim() ||
      `Hook pembuka 3 detik untuk audiens ${params.audience}`,
    captionReady: true,
    thumbnail: params.thumbnail || TREND_TOPICS[0].thumbnail,
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, checked: false })),
    qualityApproved: false,
    revisionCount: 0,
    revisionNotes: [],
    optimalSlot: slots[0].label,
    platforms: params.platforms.length > 0 ? params.platforms : ['Instagram'],
    promotions: ['Repost Story'],
    status: 'draft',
    metrics: {
      views: 0,
      engagementRate: 0,
      saves: 0,
      shares: 0,
    },
    updatedAt: 'Baru dibuat',
  };
}

export interface AnalyticsSummary {
  totalCycles: number;
  totalViews: number;
  avgEngagementRate: number;
  totalSaves: number;
  totalRevisions: number;
  topAudience: AudienceSegment;
}

export function computeAnalyticsSummary(items: ContentCycleItem[]): AnalyticsSummary {
  if (items.length === 0) {
    return {
      totalCycles: 0,
      totalViews: 0,
      avgEngagementRate: 0,
      totalSaves: 0,
      totalRevisions: 0,
      topAudience: 'Gen Z',
    };
  }

  const totalViews = items.reduce((sum, item) => sum + item.metrics.views, 0);
  const totalSaves = items.reduce((sum, item) => sum + item.metrics.saves, 0);
  const totalRevisions = items.reduce((sum, item) => sum + item.revisionCount, 0);
  const avgEngagementRate = Number(
    (
      items.reduce((sum, item) => sum + item.metrics.engagementRate, 0) /
      items.length
    ).toFixed(1)
  );

  const audienceEngagement: Record<AudienceSegment, { total: number; count: number }> = {
    'Gen Z': { total: 0, count: 0 },
    Mahasiswa: { total: 0, count: 0 },
    Umum: { total: 0, count: 0 },
  };

  for (const item of items) {
    audienceEngagement[item.audience].total += item.metrics.engagementRate;
    audienceEngagement[item.audience].count += 1;
  }

  let topAudience: AudienceSegment = 'Gen Z';
  let bestAvg = -1;
  (Object.keys(audienceEngagement) as AudienceSegment[]).forEach((aud) => {
    const entry = audienceEngagement[aud];
    if (entry.count > 0) {
      const avg = entry.total / entry.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        topAudience = aud;
      }
    }
  });

  return {
    totalCycles: items.length,
    totalViews,
    avgEngagementRate,
    totalSaves,
    totalRevisions,
    topAudience,
  };
}
