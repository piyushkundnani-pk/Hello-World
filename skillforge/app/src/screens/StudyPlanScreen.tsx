import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { StudyResource, StudyTask } from '../types';

const RESOURCE_ICONS: Record<string, string> = {
  book: '📖',
  course: '🎓',
  article: '📰',
  video: '🎥',
  podcast: '🎙',
  template: '📋',
};

const PRIORITY_CONFIG = {
  essential: { color: COLORS.danger, label: 'Essential' },
  recommended: { color: COLORS.warning, label: 'Recommended' },
  bonus: { color: COLORS.textMuted, label: 'Bonus' },
};

const TASK_TYPE_ICONS: Record<string, string> = {
  reading: '📖',
  practice: '✍️',
  project: '🔨',
  reflection: '💭',
};

const ResourceCard: React.FC<{ resource: StudyResource }> = ({ resource }) => {
  const priorityCfg = PRIORITY_CONFIG[resource.priority] || PRIORITY_CONFIG.bonus;

  return (
    <Card style={styles.resourceCard}>
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceIcon}>{RESOURCE_ICONS[resource.resource_type] || '📚'}</Text>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceTitle}>{resource.title}</Text>
          {resource.author_source && (
            <Text style={styles.resourceAuthor}>{resource.author_source}</Text>
          )}
        </View>
        <View style={[styles.priorityBadge, { borderColor: priorityCfg.color }]}>
          <Text style={[styles.priorityText, { color: priorityCfg.color }]}>{priorityCfg.label}</Text>
        </View>
      </View>

      <View style={styles.resourceForSkill}>
        <Text style={styles.resourceForLabel}>For: </Text>
        <Text style={styles.resourceForSkillText}>{resource.skill_gap}</Text>
      </View>

      <Text style={styles.resourceWhy}>{resource.why_recommended}</Text>

      <View style={styles.resourceMeta}>
        <Text style={styles.resourceTime}>⏱ {resource.time_commitment}</Text>
        <Text style={[styles.resourceType, { textTransform: 'capitalize' }]}>
          {RESOURCE_ICONS[resource.resource_type]} {resource.resource_type}
        </Text>
      </View>
    </Card>
  );
};

const TaskItem: React.FC<{ task: StudyTask; onToggle: () => void; completed: boolean }> = ({
  task,
  onToggle,
  completed,
}) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.75} style={styles.taskItem}>
    <View style={[styles.taskCheckbox, completed && styles.taskCheckboxDone]}>
      {completed && <Text style={styles.taskCheckmark}>✓</Text>}
    </View>
    <View style={styles.taskContent}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTypeIcon}>{TASK_TYPE_ICONS[task.task_type] || '📝'}</Text>
        <Text style={styles.taskTime}>{task.time_minutes} min</Text>
      </View>
      <Text style={[styles.taskText, completed && styles.taskTextDone]}>{task.task}</Text>
    </View>
  </TouchableOpacity>
);

export const StudyPlanScreen: React.FC = () => {
  const { studyPlan, parsedJob, isLoading, loadingMessage } = useAppStore();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [activePhase, setActivePhase] = useState(0);
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources' | 'practice'>('schedule');

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!studyPlan && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingOverlay visible={true} message="Building your personalized study plan..." />
      </View>
    );
  }

  if (!studyPlan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Study Plan Generating...</Text>
        <Text style={styles.emptyText}>
          Complete the assessment first to get your personalized study plan.
        </Text>
      </View>
    );
  }

  const essentialResources = studyPlan.resources?.filter((r) => r.priority === 'essential') ?? [];
  const otherResources = studyPlan.resources?.filter((r) => r.priority !== 'essential') ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{studyPlan.title}</Text>
        <View style={styles.planMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>📅 {studyPlan.total_duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⏱ {studyPlan.weekly_commitment}</Text>
          </View>
        </View>
      </View>

      {/* Focus areas */}
      {studyPlan.focus_areas?.length > 0 && (
        <Card style={styles.focusCard}>
          <Text style={styles.sectionTitle}>🎯 Focus Areas</Text>
          <View style={styles.focusList}>
            {studyPlan.focus_areas.map((area, i) => (
              <View key={i} style={styles.focusItem}>
                <Text style={styles.focusNumber}>{i + 1}</Text>
                <Text style={styles.focusText}>{area}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Tab navigation */}
      <View style={styles.tabBar}>
        {(['schedule', 'resources', 'practice'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'schedule' ? '📅 Schedule' : tab === 'resources' ? '📚 Resources' : '✍️ Practice'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Schedule tab */}
      {activeTab === 'schedule' && (
        <View>
          {/* Phase selector */}
          {studyPlan.phases?.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phaseScroll}>
              {studyPlan.phases.map((phase, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.phaseTab, activePhase === i && styles.phaseTabActive]}
                  onPress={() => setActivePhase(i)}
                >
                  <Text style={[styles.phaseTabText, activePhase === i && styles.phaseTabTextActive]}>
                    {phase.phase_name}
                  </Text>
                  <Text style={styles.phaseDuration}>{phase.duration}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Active phase tasks */}
          {studyPlan.phases?.[activePhase] && (
            <View style={styles.phaseContent}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseName}>{studyPlan.phases[activePhase].phase_name}</Text>
                <Text style={styles.phaseSkills}>
                  Focus: {studyPlan.phases[activePhase].focus_skills?.join(', ')}
                </Text>
              </View>

              {/* Progress for this phase */}
              {(() => {
                const tasks = studyPlan.phases[activePhase].daily_tasks || [];
                const done = tasks.filter((_, idx) => completedTasks.has(`${activePhase}-${idx}`)).length;
                return tasks.length > 0 ? (
                  <View style={styles.phaseProgress}>
                    <View style={styles.phaseProgressBar}>
                      <View style={[styles.phaseProgressFill, { width: `${(done / tasks.length) * 100}%` }]} />
                    </View>
                    <Text style={styles.phaseProgressText}>{done}/{tasks.length} tasks</Text>
                  </View>
                ) : null;
              })()}

              {studyPlan.phases[activePhase].daily_tasks?.map((task, taskIdx) => (
                <TaskItem
                  key={taskIdx}
                  task={task}
                  completed={completedTasks.has(`${activePhase}-${taskIdx}`)}
                  onToggle={() => toggleTask(`${activePhase}-${taskIdx}`)}
                />
              ))}
            </View>
          )}

          {/* Milestone checks */}
          {studyPlan.milestone_checks?.length > 0 && (
            <Card style={styles.milestonesCard}>
              <Text style={styles.sectionTitle}>🏁 Milestone Checks</Text>
              {studyPlan.milestone_checks.map((milestone, i) => (
                <View key={i} style={styles.milestoneItem}>
                  <Text style={styles.milestoneAfter}>After {milestone.after}</Text>
                  <Text style={styles.milestoneQuestion}>{milestone.self_assessment}</Text>
                  <Text style={styles.milestoneImprovement}>{milestone.expected_improvement}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      )}

      {/* Resources tab */}
      {activeTab === 'resources' && (
        <View>
          {essentialResources.length > 0 && (
            <View style={styles.resourceSection}>
              <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
                🔴 Essential Resources
              </Text>
              {essentialResources.map((r, i) => <ResourceCard key={i} resource={r} />)}
            </View>
          )}

          {otherResources.length > 0 && (
            <View style={styles.resourceSection}>
              <Text style={styles.sectionTitle}>📚 Recommended & Bonus</Text>
              {otherResources.map((r, i) => <ResourceCard key={i} resource={r} />)}
            </View>
          )}
        </View>
      )}

      {/* Practice tab */}
      {activeTab === 'practice' && (
        <View>
          <Text style={styles.practiceIntro}>
            These exercises are calibrated to your specific gaps and the target company's domain.
          </Text>
          {studyPlan.practice_exercises?.map((exercise, i) => (
            <Card key={i} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseSkill}>{exercise.skill}</Text>
                <View style={styles.exerciseMeta}>
                  <Text style={styles.exerciseDifficulty}>{exercise.difficulty}</Text>
                  <Text style={styles.exerciseTime}>{exercise.time_limit}</Text>
                </View>
              </View>
              <Text style={styles.exerciseText}>{exercise.exercise}</Text>
              <View style={styles.exerciseCriteria}>
                <Text style={styles.criteriaLabel}>Success criteria:</Text>
                <Text style={styles.criteriaText}>{exercise.evaluation_criteria}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg },
  emptyContainer: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700', marginBottom: SPACING.sm },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  header: { marginBottom: SPACING.lg },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm, lineHeight: 29 },
  planMeta: { flexDirection: 'row', gap: SPACING.sm },
  metaChip: { backgroundColor: COLORS.primaryBg, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  metaText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  focusCard: { marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', marginBottom: SPACING.md },
  focusList: { gap: SPACING.sm },
  focusItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  focusNumber: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryBg, color: COLORS.primary,
    fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 24,
  },
  focusText: { flex: 1, color: COLORS.text, fontSize: 14 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.sm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  phaseScroll: { marginBottom: SPACING.md },
  phaseTab: {
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phaseTabActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg },
  phaseTabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  phaseTabTextActive: { color: COLORS.primary },
  phaseDuration: { color: COLORS.textFaint, fontSize: 10, marginTop: 2 },
  phaseContent: { gap: SPACING.sm },
  phaseHeader: { marginBottom: SPACING.sm },
  phaseName: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  phaseSkills: { color: COLORS.primary, fontSize: 12, marginTop: 2 },
  phaseProgress: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  phaseProgressBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  phaseProgressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: RADIUS.full },
  phaseProgressText: { color: COLORS.textMuted, fontSize: 12 },
  taskItem: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xs },
  taskCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  taskCheckboxDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskCheckmark: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  taskContent: { flex: 1, gap: 4 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTypeIcon: { fontSize: 13 },
  taskTime: { color: COLORS.textFaint, fontSize: 11 },
  taskText: { color: COLORS.text, fontSize: 13, lineHeight: 19 },
  taskTextDone: { color: COLORS.textFaint, textDecorationLine: 'line-through' },
  milestonesCard: { marginTop: SPACING.md, gap: SPACING.md },
  milestoneItem: { borderLeftWidth: 2, borderLeftColor: COLORS.primary, paddingLeft: SPACING.md, gap: 4 },
  milestoneAfter: { color: COLORS.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  milestoneQuestion: { color: COLORS.text, fontSize: 13, lineHeight: 19 },
  milestoneImprovement: { color: COLORS.success, fontSize: 12, fontWeight: '600' },
  resourceSection: { marginBottom: SPACING.lg },
  resourceCard: { marginBottom: SPACING.sm },
  resourceHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  resourceIcon: { fontSize: 22 },
  resourceInfo: { flex: 1 },
  resourceTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  resourceAuthor: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  priorityBadge: { borderWidth: 1, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  resourceForSkill: { flexDirection: 'row', marginBottom: 4 },
  resourceForLabel: { color: COLORS.textFaint, fontSize: 12 },
  resourceForSkillText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  resourceWhy: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: SPACING.sm },
  resourceMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  resourceTime: { color: COLORS.textFaint, fontSize: 11 },
  resourceType: { color: COLORS.textFaint, fontSize: 11 },
  practiceIntro: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginBottom: SPACING.md },
  exerciseCard: { marginBottom: SPACING.md },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  exerciseSkill: { color: COLORS.primary, fontSize: 14, fontWeight: '700', flex: 1 },
  exerciseMeta: { alignItems: 'flex-end', gap: 2 },
  exerciseDifficulty: { color: COLORS.warning, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  exerciseTime: { color: COLORS.textFaint, fontSize: 11 },
  exerciseText: { color: COLORS.text, fontSize: 13, lineHeight: 20, marginBottom: SPACING.md },
  exerciseCriteria: { backgroundColor: COLORS.bgElevated, borderRadius: RADIUS.sm, padding: SPACING.sm, gap: 4 },
  criteriaLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  criteriaText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
