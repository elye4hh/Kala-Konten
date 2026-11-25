export type AudienceSegment = 'Gen Z' | 'Mahasiswa' | 'Umum';

export type Platform = 'Instagram' | 'TikTok' | 'YouTube Shorts';

export type ContentFormat = 'Reels' | 'Carousel' | 'TikTok Video' | 'Shorts';

export type WorkflowStage = 'A' | 'B' | 'C';

export type NavTab = 'home' | 'jadwal' | 'analitik' | 'profil';

export type ContentStatus = 'draft' | 'scheduled' | 'published';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TrendTopic {
  id: string;
  title: string;
  audience: AudienceSegment;
  baseScore: number;
  format: ContentFormat;
  hookHint: string;
  thumbnail: string;
  trendMomentum: string;
}

export interface OptimalSlot {
  id: string;
  label: string;
  day: string;
  time: string;
  reason: string;
  upliftLabel: string;
}

export interface PerformanceMetrics {
  views: number;
  engagementRate: number;
  saves: number;
  shares: number;
}

export interface ContentCycleItem {
  id: string;
  iteration: number;
  title: string;
  audience: AudienceSegment;
  format: ContentFormat;
  relevanceScore: number;
  activeStage: WorkflowStage;
  topicApproved: boolean;
  ideaChangeCount: number;
  hookText: string;
  captionReady: boolean;
  thumbnail: string;
  checklist: ChecklistItem[];
  qualityApproved: boolean;
  revisionCount: number;
  revisionNotes: string[];
  optimalSlot: string;
  platforms: Platform[];
  promotions: string[];
  status: ContentStatus;
  metrics: PerformanceMetrics;
  updatedAt: string;
}

export interface WorkspacePreferences {
  teamName: string;
  authors: string[];
  defaultAudience: AudienceSegment;
  weeklyTarget: number;
  preferredPlatforms: Platform[];
}
