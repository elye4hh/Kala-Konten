import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceQualityDecision,
  advanceTopicDecision,
  areAllChecklistItemsChecked,
  calculateRelevanceScore,
  completeIterationCycle,
  computeAnalyticsSummary,
  createNewDraftItem,
  filterTrendTopics,
} from './workflow';
import {
  INITIAL_ACTIVE_DRAFT,
  INITIAL_COMPLETED_HISTORY,
  TREND_TOPICS,
} from './seedData';

test('filterTrendTopics filters by audience and search query', () => {
  const mhsResults = filterTrendTopics(TREND_TOPICS, 'Mahasiswa', '');
  assert.ok(mhsResults.length >= 2);
  assert.ok(mhsResults.every((t) => t.audience === 'Mahasiswa'));

  const queryResults = filterTrendTopics(TREND_TOPICS, 'Semua', 'pomodoro');
  assert.equal(queryResults.length, 1);
  assert.match(queryResults[0].title, /Pomodoro/i);
});

test('calculateRelevanceScore rewards aligned keywords and stays bounded', () => {
  const high = calculateRelevanceScore(
    'Tips Manajemen Waktu Kuliah untuk Organisasi Kampus',
    'Mahasiswa',
    85
  );
  const low = calculateRelevanceScore('Judul', 'Umum', 80);
  assert.ok(high > low);
  assert.ok(high <= 98);
  assert.ok(low >= 58);
});

test('advanceTopicDecision handles Ya -> Stage B and Tidak -> Ubah Ide loop', () => {
  const rejected = advanceTopicDecision(INITIAL_ACTIVE_DRAFT, false);
  assert.equal(rejected.activeStage, 'A');
  assert.equal(rejected.topicApproved, false);
  assert.equal(rejected.ideaChangeCount, 1);
  assert.notEqual(rejected.title, INITIAL_ACTIVE_DRAFT.title);

  const approved = advanceTopicDecision(rejected, true);
  assert.equal(approved.activeStage, 'B');
  assert.equal(approved.topicApproved, true);
});

test('advanceQualityDecision handles Ya -> Stage C and Tidak -> Revisi loop', () => {
  const stageB = advanceTopicDecision(INITIAL_ACTIVE_DRAFT, true);
  assert.equal(areAllChecklistItemsChecked(stageB.checklist), false);

  const revised = advanceQualityDecision(stageB, false, 'Audio perlu dinormalisasi');
  assert.equal(revised.activeStage, 'B');
  assert.equal(revised.qualityApproved, false);
  assert.equal(revised.revisionCount, 1);
  assert.equal(revised.revisionNotes[0], 'Audio perlu dinormalisasi');

  const approved = advanceQualityDecision(revised, true);
  assert.equal(approved.activeStage, 'C');
  assert.equal(approved.qualityApproved, true);
  assert.equal(areAllChecklistItemsChecked(approved.checklist), true);
  assert.equal(approved.status, 'scheduled');
});

test('completeIterationCycle archives completed cycle and creates next Stage A iteration', () => {
  const stageC = advanceQualityDecision(
    advanceTopicDecision(INITIAL_ACTIVE_DRAFT, true),
    true
  );
  const { completedItem, nextDraft } = completeIterationCycle(stageC);

  assert.equal(completedItem.iteration, INITIAL_ACTIVE_DRAFT.iteration);
  assert.ok(completedItem.metrics.views > 0);
  assert.ok(completedItem.metrics.engagementRate > 0);

  assert.equal(nextDraft.iteration, INITIAL_ACTIVE_DRAFT.iteration + 1);
  assert.equal(nextDraft.activeStage, 'A');
  assert.equal(nextDraft.topicApproved, false);
  assert.equal(nextDraft.qualityApproved, false);
  assert.equal(nextDraft.status, 'draft');
});

test('createNewDraftItem validates and initializes Stage A draft', () => {
  const custom = createNewDraftItem({
    iteration: 5,
    title: 'Checklist Persiapan Magang Semester 6',
    audience: 'Mahasiswa',
    format: 'Carousel',
    platforms: ['Instagram', 'TikTok'],
  });

  assert.equal(custom.iteration, 5);
  assert.equal(custom.audience, 'Mahasiswa');
  assert.equal(custom.activeStage, 'A');
  assert.equal(custom.platforms.length, 2);
});

test('computeAnalyticsSummary aggregates completed cycles accurately', () => {
  const summary = computeAnalyticsSummary(INITIAL_COMPLETED_HISTORY);
  assert.equal(summary.totalCycles, 3);
  assert.equal(summary.totalViews, 9800 + 12600 + 15900);
  assert.equal(summary.topAudience, 'Gen Z');
});
