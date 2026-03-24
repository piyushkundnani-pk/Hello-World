import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { Badge } from '../components/ui/Badge';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ParsedJobPosting } from '../types';

const JD_PLACEHOLDER = `Paste the full job description here...

Example:
Senior Product Manager – AI Platform
Company: InCruiter | Location: Bengaluru | CTC: ₹16–20 LPA

About the Role:
We're looking for an experienced PM to lead our AI Interview product. You will own the roadmap for our LLM-powered assessment platform, working closely with ML engineers and data scientists...

Responsibilities:
• Define product vision and strategy for AI-driven interview evaluation
• Work with ML team on model performance vs user experience trade-offs
• Write PRDs and lead sprint planning...

Requirements:
• 4+ years of product management experience
• Experience with AI/ML products
• Strong data analysis skills...`;

const IMPORTANCE_CONFIG = {
  must_have: { color: COLORS.danger, bg: COLORS.dangerBg, label: 'Must Have' },
  strong_preference: { color: COLORS.warning, bg: COLORS.warningBg, label: 'Strong Pref' },
  nice_to_have: { color: COLORS.success, bg: COLORS.successBg, label: 'Nice to Have' },
};

export const JobPostingScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { parseJob, parsedJob, parsedResume, isLoading, loadingMessage, error, setError } = useAppStore();
  const [jobText, setJobText] = useState('');

  const handleParseJob = async () => {
    if (jobText.trim().length < 80) {
      setError('Please paste the full job description (at least a few sentences).');
      return;
    }
    await parseJob(jobText);
  };

  const handleStartAssessment = () => {
    navigation.navigate('AssessmentHub');
  };

  const renderMatchPreview = (job: ParsedJobPosting) => {
    const weights = job.evaluation_weights;
    const skillEntries = Object.entries(weights).sort(([, a], [, b]) => b - a);

    // Simple preliminary match — compare resume levels vs weights
    const resumeSkills = parsedResume?.pm_skills_demonstrated;
    let matchScore = 0;
    if (resumeSkills) {
      const resumeLevels: Record<string, number> = {
        product_discovery: resumeSkills.product_discovery.estimated_level,
        execution_delivery: resumeSkills.execution_delivery.estimated_level,
        metrics_analytics: resumeSkills.metrics_analytics.estimated_level,
        technical_acumen: resumeSkills.technical_acumen.estimated_level,
        stakeholder_leadership: resumeSkills.stakeholder_leadership.estimated_level,
        domain_expertise: resumeSkills.domain_expertise.estimated_level,
      };
      let totalWeight = 0;
      let weightedMatch = 0;
      for (const [key, weight] of skillEntries) {
        totalWeight += weight;
        const level = (resumeLevels[key] || 1) / 5;
        weightedMatch += level * weight;
      }
      matchScore = Math.round((weightedMatch / totalWeight) * 100);
    }

    return (
      <View>
        <Card style={styles.jobCard} highlighted>
          {/* Job header */}
          <View style={styles.jobHeader}>
            <View style={styles.companyIcon}>
              <Text style={styles.companyEmoji}>🏢</Text>
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>{job.job_title}</Text>
              <Text style={styles.companyName}>{job.company}</Text>
              <Text style={styles.jobMeta}>
                {job.location} · {job.seniority_level} · {job.domain}
              </Text>
            </View>
          </View>

          {/* Preliminary match */}
          {parsedResume && (
            <View style={styles.matchPreview}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchLabel}>Preliminary Match</Text>
                <Text style={[
                  styles.matchScore,
                  { color: matchScore >= 70 ? COLORS.success : matchScore >= 50 ? COLORS.warning : COLORS.danger }
                ]}>
                  {matchScore}%
                </Text>
              </View>
              <Text style={styles.matchNote}>Full analysis after assessment</Text>
            </View>
          )}

          {/* Top required skills */}
          <Text style={styles.sectionLabel}>Top Skills Required:</Text>
          {job.required_skills.slice(0, 5).map((skill, i) => {
            const cfg = IMPORTANCE_CONFIG[skill.importance] || IMPORTANCE_CONFIG.nice_to_have;
            return (
              <View key={i} style={styles.skillRow}>
                <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
                <Text style={styles.skillName}>{skill.skill_name}</Text>
                <Text style={styles.skillLevel}>L{skill.minimum_level_needed}+</Text>
              </View>
            );
          })}

          {/* Top 3 interview topics */}
          {job.interview_likely_topics.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
                Likely Interview Topics:
              </Text>
              {job.interview_likely_topics.slice(0, 3).map((topic, i) => (
                <View key={i} style={styles.topicRow}>
                  <Text style={[
                    styles.topicProb,
                    { color: topic.probability === 'high' ? COLORS.danger : topic.probability === 'medium' ? COLORS.warning : COLORS.textMuted }
                  ]}>
                    {topic.probability === 'high' ? '🔴' : topic.probability === 'medium' ? '🟡' : '⚪'} {topic.probability.toUpperCase()}
                  </Text>
                  <Text style={styles.topicText}>{topic.topic}</Text>
                </View>
              ))}
            </>
          )}

          {/* Skill weights visualization */}
          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Assessment Focus:</Text>
          {skillEntries.slice(0, 4).map(([key, weight]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            const pct = Math.round(weight * 100);
            return (
              <View key={key} style={styles.weightRow}>
                <Text style={styles.weightLabel}>{label}</Text>
                <View style={styles.weightBar}>
                  <View style={[styles.weightFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.weightPct}>{pct}%</Text>
              </View>
            );
          })}
        </Card>

        {/* Culture signals */}
        {(job.culture_signals.pace || job.culture_signals.autonomy_level) && (
          <Card style={styles.cultureCard}>
            <Text style={styles.sectionLabel}>Culture Signals:</Text>
            <View style={styles.cultureRow}>
              {job.culture_signals.pace && (
                <View style={styles.culturePill}>
                  <Text style={styles.culturePillText}>
                    {job.culture_signals.pace === 'startup_fast' ? '🚀 Fast-paced' :
                     job.culture_signals.pace === 'enterprise_steady' ? '🏛 Enterprise' : '📈 Growth'}
                  </Text>
                </View>
              )}
              {job.culture_signals.autonomy_level && (
                <View style={styles.culturePill}>
                  <Text style={styles.culturePillText}>
                    {job.culture_signals.autonomy_level === 'high' ? '🎯 High autonomy' : '🤝 Collaborative'}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        <Button
          title="Start Quick Assessment →"
          onPress={handleStartAssessment}
          size="lg"
          style={styles.startBtn}
        />
        <Text style={styles.assessNote}>
          10 MCQs + 2 open-ended questions · ~15 min · Calibrated to this specific role
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={isLoading} message={loadingMessage || 'Analyzing job requirements...'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>Add Job Posting</Text>
          <Text style={styles.subtitle}>
            Paste the complete job description. The AI will extract what skills matter most for this specific role.
          </Text>
        </View>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {!parsedJob ? (
          <View>
            <TextInput
              style={styles.textInput}
              multiline
              value={jobText}
              onChangeText={setJobText}
              placeholder={JD_PLACEHOLDER}
              placeholderTextColor={COLORS.textFaint}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{jobText.length} chars</Text>
            <Button
              title="Analyze Job Posting →"
              onPress={handleParseJob}
              disabled={jobText.trim().length < 80}
              style={styles.analyzeBtn}
            />
          </View>
        ) : (
          <>
            {renderMatchPreview(parsedJob)}
            <Button
              title="← Edit Job Posting"
              onPress={() => useAppStore.getState().setParsedJob(null as unknown as ParsedJobPosting)}
              variant="ghost"
              style={{ marginTop: SPACING.md }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { marginBottom: SPACING.lg },
  step: { color: COLORS.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm },
  subtitle: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  textInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 240,
    fontFamily: 'monospace',
  },
  charCount: { color: COLORS.textFaint, fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: SPACING.md },
  analyzeBtn: { marginTop: SPACING.sm },
  jobCard: { marginBottom: SPACING.md },
  jobHeader: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  companyIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyEmoji: { fontSize: 26 },
  jobInfo: { flex: 1 },
  jobTitle: { color: COLORS.white, fontSize: 17, fontWeight: '700', marginBottom: 2 },
  companyName: { color: COLORS.primary, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  jobMeta: { color: COLORS.textMuted, fontSize: 12 },
  matchPreview: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  matchLabel: { color: COLORS.textMuted, fontSize: 13 },
  matchScore: { fontSize: 22, fontWeight: '800' },
  matchNote: { color: COLORS.textFaint, fontSize: 11 },
  sectionLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  skillName: { flex: 1, color: COLORS.text, fontSize: 13 },
  skillLevel: { color: COLORS.textFaint, fontSize: 12 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  topicProb: { fontSize: 11, fontWeight: '700', width: 72 },
  topicText: { flex: 1, color: COLORS.textMuted, fontSize: 13 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  weightLabel: { color: COLORS.textMuted, fontSize: 12, width: 120 },
  weightBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  weightFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  weightPct: { color: COLORS.textFaint, fontSize: 11, width: 30, textAlign: 'right' },
  cultureCard: { marginBottom: SPACING.md },
  cultureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  culturePill: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  culturePillText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  startBtn: { marginBottom: SPACING.sm },
  assessNote: { color: COLORS.textFaint, fontSize: 12, textAlign: 'center' },
});
