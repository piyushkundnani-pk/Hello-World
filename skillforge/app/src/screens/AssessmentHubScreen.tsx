import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export const AssessmentHubScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { parsedResume, parsedJob, startAssessment, isLoading, loadingMessage, error, setError } = useAppStore();

  const handleStartQuickAssessment = async () => {
    try {
      await startAssessment();
      navigation.navigate('Assessment');
    } catch {
      // error already set in store
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} message={loadingMessage || 'Crafting your assessment...'} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {/* Profile Summary */}
        {parsedResume && parsedJob && (
          <Card style={styles.profileBar}>
            <View style={styles.profileBarRow}>
              <View>
                <Text style={styles.profileBarName}>{parsedResume.candidate_name}</Text>
                <Text style={styles.profileBarRole}>{parsedResume.current_role}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View>
                <Text style={styles.profileBarJobTitle}>{parsedJob.job_title}</Text>
                <Text style={styles.profileBarCompany}>{parsedJob.company}</Text>
              </View>
            </View>
          </Card>
        )}

        <Text style={styles.heading}>Choose Your Assessment</Text>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {/* Quick Assessment — MVP core */}
        <TouchableOpacity onPress={handleStartQuickAssessment} activeOpacity={0.85}>
          <Card style={styles.assessCard} highlighted>
            <View style={styles.assessHeader}>
              <View style={styles.assessIconContainer}>
                <Text style={styles.assessIcon}>⚡</Text>
              </View>
              <View style={styles.assessBadge}>
                <Text style={styles.assessBadgeText}>RECOMMENDED</Text>
              </View>
            </View>
            <Text style={styles.assessTitle}>Quick Assessment</Text>
            <Text style={styles.assessDesc}>
              10 scenario-based MCQs + 2 open-ended questions, all calibrated to your resume and this specific job posting.
            </Text>
            <View style={styles.assessMeta}>
              <View style={styles.metaChip}><Text style={styles.metaText}>⏱ ~15 min</Text></View>
              <View style={styles.metaChip}><Text style={styles.metaText}>📝 12 questions</Text></View>
              <View style={styles.metaChip}><Text style={styles.metaText}>🎯 JD-specific</Text></View>
            </View>
            <View style={styles.assessCta}>
              <Text style={styles.assessCtaText}>Start Now →</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Coming Soon Cards */}
        {[
          {
            icon: '🔬',
            title: 'Deep Assessment',
            desc: 'Case study + MCQs + behavioral questions. ~45 minutes.',
            meta: ['~45 min', 'Case study', 'V2'],
          },
          {
            icon: '🎤',
            title: 'Mock Interview',
            desc: 'AI hiring manager conducts a live 30-min PM interview.',
            meta: ['30 min', 'Text-based', 'V2'],
          },
        ].map((item) => (
          <Card key={item.title} style={styles.comingSoonCard}>
            <View style={styles.assessHeader}>
              <View style={[styles.assessIconContainer, { backgroundColor: COLORS.bgElevated }]}>
                <Text style={styles.assessIcon}>{item.icon}</Text>
              </View>
              <View style={[styles.assessBadge, { backgroundColor: COLORS.bgElevated }]}>
                <Text style={[styles.assessBadgeText, { color: COLORS.textFaint }]}>COMING SOON</Text>
              </View>
            </View>
            <Text style={styles.assessTitle}>{item.title}</Text>
            <Text style={styles.assessDesc}>{item.desc}</Text>
            <View style={styles.assessMeta}>
              {item.meta.map((m) => (
                <View key={m} style={[styles.metaChip, { backgroundColor: COLORS.bgElevated }]}>
                  <Text style={[styles.metaText, { color: COLORS.textFaint }]}>{m}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* What to expect */}
        <Card style={styles.expectCard}>
          <Text style={styles.expectTitle}>What to Expect</Text>
          {[
            ['🎯', 'Questions are unique to YOUR resume + this specific JD'],
            ['📊', 'MCQs test judgment, not just recall — all options are plausible'],
            ['✍️', 'Open-ended answers are evaluated by Claude against PM interview standards'],
            ['🔴', 'Scoring is realistic — 8/10 is rare, 5-7 is solid PM range'],
            ['📈', 'Results include gap analysis + personalized study plan'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.expectRow}>
              <Text style={styles.expectIcon}>{icon}</Text>
              <Text style={styles.expectText}>{text}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  profileBar: { marginBottom: SPACING.lg },
  profileBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBarName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  profileBarRole: { color: COLORS.textMuted, fontSize: 12 },
  arrow: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  profileBarJobTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '700', textAlign: 'right' },
  profileBarCompany: { color: COLORS.textMuted, fontSize: 12, textAlign: 'right' },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  assessCard: {
    marginBottom: SPACING.md,
    borderColor: COLORS.primary,
  },
  comingSoonCard: {
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  assessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  assessIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assessIcon: { fontSize: 22 },
  assessBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  assessBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  assessTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  assessDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  assessMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  metaChip: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  metaText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  assessCta: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  assessCtaText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  expectCard: { marginTop: SPACING.sm },
  expectTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  expectRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  expectIcon: { fontSize: 14, marginTop: 1 },
  expectText: { flex: 1, color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
});
