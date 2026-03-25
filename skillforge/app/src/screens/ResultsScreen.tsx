import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RadarChart } from 'react-native-chart-kit';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useAppStore } from '../stores/appStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { COLORS, SPACING, RADIUS, SKILL_CATEGORIES, STATUS_CONFIG } from '../constants/theme';
import { GapAnalysis, SkillBreakdown } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = SCREEN_WIDTH - SPACING.lg * 2 - 20;

// Custom spider/radar chart using SVG
const SpiderChart: React.FC<{
  candidateLevels: number[];
  requiredLevels: number[];
  labels: string[];
}> = ({ candidateLevels, requiredLevels, labels }) => {
  const size = CHART_SIZE;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) * 0.75;
  const n = labels.length;
  const maxVal = 5;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / maxVal) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = maxR + 22;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const candidatePoints = candidateLevels.map((v, i) => getPoint(i, v));
  const requiredPoints = requiredLevels.map((v, i) => getPoint(i, v));

  const toPolygonPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const gridLevels = [1, 2, 3, 4, 5];
  const gridColors = ['#1e3a5f', '#1e3a5f', '#1e3a5f', '#1e3a5f', '#2d4a6f'];

  return (
    <Svg width={size} height={size}>
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
        return (
          <Polygon
            key={level}
            points={toPolygonPoints(pts)}
            fill="none"
            stroke={level === 5 ? '#2d4a6f' : '#1e3a5f'}
            strokeWidth={level === 5 ? 1.5 : 1}
          />
        );
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const outerPt = getPoint(i, 5);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outerPt.x}
            y2={outerPt.y}
            stroke="#1e3a5f"
            strokeWidth={1}
          />
        );
      })}

      {/* Required area (dashed red) */}
      <Polygon
        points={toPolygonPoints(requiredPoints)}
        fill="rgba(244, 63, 94, 0.08)"
        stroke={COLORS.danger}
        strokeWidth={2}
        strokeDasharray="5,3"
      />

      {/* Candidate area (solid blue) */}
      <Polygon
        points={toPolygonPoints(candidatePoints)}
        fill="rgba(67, 97, 238, 0.2)"
        stroke={COLORS.primary}
        strokeWidth={2.5}
      />

      {/* Candidate dots */}
      {candidatePoints.map((pt, i) => (
        <Circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={5}
          fill={COLORS.primary}
          stroke={COLORS.bg}
          strokeWidth={2}
        />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const pt = getLabelPoint(i);
        return (
          <SvgText
            key={i}
            x={pt.x}
            y={pt.y}
            fill={COLORS.textMuted}
            fontSize={10}
            fontWeight="600"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {label}
          </SvgText>
        );
      })}

      {/* Level labels on one axis */}
      {[1, 2, 3, 4, 5].map((level) => {
        const pt = getPoint(0, level);
        return (
          <SvgText
            key={level}
            x={pt.x + 8}
            y={pt.y}
            fill="#475569"
            fontSize={9}
            textAnchor="start"
          >
            {level}
          </SvgText>
        );
      })}
    </Svg>
  );
};

const SkillCard: React.FC<{ breakdown: SkillBreakdown; onExpand: () => void; expanded: boolean }> = ({
  breakdown,
  onExpand,
  expanded,
}) => {
  const cfg = STATUS_CONFIG[breakdown.status] || STATUS_CONFIG.on_track;
  const barWidth = `${(breakdown.candidate_level / 5) * 100}%`;
  const requiredBarWidth = `${(breakdown.required_level / 5) * 100}%`;

  return (
    <TouchableOpacity onPress={onExpand} activeOpacity={0.85}>
      <Card style={styles.skillCard}>
        <View style={styles.skillCardHeader}>
          <Text style={styles.skillCategoryName}>{breakdown.skill_category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Level comparison bars */}
        <View style={styles.levelBars}>
          <View style={styles.levelBarRow}>
            <Text style={styles.levelBarLabel}>You</Text>
            <View style={styles.levelBarTrack}>
              <View style={[styles.levelBarFill, { width: barWidth as `${number}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <Text style={styles.levelBarValue}>{breakdown.candidate_level.toFixed(1)}</Text>
          </View>
          <View style={styles.levelBarRow}>
            <Text style={styles.levelBarLabel}>Required</Text>
            <View style={styles.levelBarTrack}>
              <View style={[styles.levelBarFill, { width: requiredBarWidth as `${number}%`, backgroundColor: COLORS.danger }]} />
            </View>
            <Text style={styles.levelBarValue}>{breakdown.required_level.toFixed(1)}</Text>
          </View>
        </View>

        {/* Gap indicator */}
        <View style={styles.gapRow}>
          <Text style={styles.gapLabel}>Gap: </Text>
          <Text style={[styles.gapValue, {
            color: breakdown.gap >= 0 ? COLORS.success : Math.abs(breakdown.gap) >= 2 ? COLORS.danger : COLORS.warning
          }]}>
            {breakdown.gap > 0 ? '+' : ''}{breakdown.gap.toFixed(1)} levels
          </Text>
        </View>

        {/* Expandable detail */}
        {expanded && (
          <View style={styles.expandedSection}>
            {breakdown.evidence_from_assessment && (
              <View style={styles.evidenceBlock}>
                <Text style={styles.evidenceLabel}>From Assessment:</Text>
                <Text style={styles.evidenceText}>{breakdown.evidence_from_assessment}</Text>
              </View>
            )}

            {breakdown.sub_skills?.length > 0 && (
              <View style={styles.subSkills}>
                <Text style={styles.subSkillsHeader}>Sub-skills:</Text>
                {breakdown.sub_skills.slice(0, 3).map((sub, i) => (
                  <View key={i} style={styles.subSkillRow}>
                    <Text style={styles.subSkillName}>{sub.name}</Text>
                    <Text style={[
                      styles.subSkillGap,
                      { color: sub.gap >= 0 ? COLORS.success : sub.gap <= -2 ? COLORS.danger : COLORS.warning }
                    ]}>
                      {sub.candidate_level} → {sub.required_level}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.expandArrow}>{expanded ? '▲ Collapse' : '▼ Details'}</Text>
          </View>
        )}

        {!expanded && (
          <Text style={styles.expandArrow}>▼ Details</Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { gapAnalysis, studyPlan, isLoading, loadingMessage, error, setError } = useAppStore();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'breakdown'>('radar');

  const candidateLevels = gapAnalysis?.skill_breakdown.map((s) => s.candidate_level) ??
    SKILL_CATEGORIES.map(() => 0);
  const requiredLevels = gapAnalysis?.skill_breakdown.map((s) => s.required_level) ??
    SKILL_CATEGORIES.map(() => 3);
  const chartLabels = SKILL_CATEGORIES.map((c) => c.short);

  const matchColor =
    (gapAnalysis?.overall_match_score ?? 0) >= 75 ? COLORS.success :
    (gapAnalysis?.overall_match_score ?? 0) >= 55 ? COLORS.warning : COLORS.danger;

  return (
    <>
      <LoadingOverlay visible={isLoading} message={loadingMessage || 'Generating your gap analysis...'} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Assessment Results</Text>
          {gapAnalysis && (
            <View style={styles.matchOverall}>
              <Text style={[styles.matchScore, { color: matchColor }]}>
                {gapAnalysis.overall_match_score}%
              </Text>
              <Text style={styles.matchLabel}>{gapAnalysis.overall_match_label}</Text>
            </View>
          )}
        </View>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {/* Loading state */}
        {isLoading && !gapAnalysis && (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>🔄 Generating your gap analysis...</Text>
            <Text style={styles.loadingText}>
              Claude is analyzing your assessment responses against the job requirements. This takes 30-60 seconds.
            </Text>
          </Card>
        )}

        {gapAnalysis && (
          <>
            {/* Tab selector */}
            <View style={styles.tabBar}>
              {(['radar', 'breakdown'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'radar' ? '🕸 Radar Chart' : '📋 Breakdown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeTab === 'radar' ? (
              <Card style={styles.radarCard}>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={styles.legendText}>Your Level</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.danger, borderStyle: 'dashed' }]} />
                    <Text style={styles.legendText}>Required</Text>
                  </View>
                </View>
                <SpiderChart
                  candidateLevels={candidateLevels}
                  requiredLevels={requiredLevels}
                  labels={chartLabels}
                />
              </Card>
            ) : (
              <View style={styles.breakdownList}>
                {gapAnalysis.skill_breakdown.map((breakdown) => (
                  <SkillCard
                    key={breakdown.skill_key}
                    breakdown={breakdown}
                    expanded={expandedSkill === breakdown.skill_key}
                    onExpand={() => setExpandedSkill(
                      expandedSkill === breakdown.skill_key ? null : breakdown.skill_key
                    )}
                  />
                ))}
              </View>
            )}

            {/* Advantages */}
            {gapAnalysis.advantages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🟢 Your Advantages</Text>
                {gapAnalysis.advantages.map((adv, i) => (
                  <Card key={i} style={[styles.advantageCard, { borderColor: COLORS.success }]}>
                    <Text style={styles.advantageSkill}>{adv.skill}</Text>
                    <Text style={styles.advantageWhy}>{adv.why_its_an_advantage}</Text>
                    <View style={styles.leverageBox}>
                      <Text style={styles.leverageLabel}>How to use in interview:</Text>
                      <Text style={styles.leverageText}>{adv.how_to_leverage_in_interview}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Critical Gaps */}
            {gapAnalysis.critical_gaps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔴 Critical Gaps</Text>
                {gapAnalysis.critical_gaps.map((gap, i) => (
                  <Card key={i} style={[styles.gapCard, { borderColor: COLORS.danger }]}>
                    <View style={styles.gapCardHeader}>
                      <Text style={styles.gapSkillName}>{gap.skill}</Text>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: gap.gap_severity === 'critical' ? COLORS.dangerBg : COLORS.warningBg }
                      ]}>
                        <Text style={[
                          styles.severityText,
                          { color: gap.gap_severity === 'critical' ? COLORS.danger : COLORS.warning }
                        ]}>
                          {gap.gap_severity}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.gapLevels}>
                      Current: L{gap.current_level} → Needed: L{gap.needed_level}
                    </Text>
                    <Text style={styles.gapWhy}>{gap.why_it_matters_for_this_role}</Text>
                    <View style={styles.gapMeta}>
                      <Text style={[styles.gapMetaItem, { color: gap.can_be_closed_quickly ? COLORS.success : COLORS.warning }]}>
                        {gap.can_be_closed_quickly ? '✅ Can close quickly' : '⚠️ Takes time'}
                      </Text>
                      <Text style={styles.gapMetaItem}>⏱ {gap.estimated_time_to_close}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Interview readiness */}
            <Card style={styles.readinessCard}>
              <Text style={styles.sectionTitle}>🎯 Interview Readiness</Text>
              <View style={styles.readinessRow}>
                <Text style={styles.readinessLabel}>Ready in:</Text>
                <Text style={styles.readinessValue}>{gapAnalysis.interview_readiness.ready_in}</Text>
              </View>
              <View style={styles.readinessBlock}>
                <Text style={styles.readinessBlockLabel}>Biggest risk:</Text>
                <Text style={styles.readinessBlockText}>{gapAnalysis.interview_readiness.biggest_risk_in_interview}</Text>
              </View>
              <View style={styles.readinessBlock}>
                <Text style={styles.readinessBlockLabel}>Strongest card:</Text>
                <Text style={[styles.readinessBlockText, { color: COLORS.success }]}>
                  {gapAnalysis.interview_readiness.strongest_card_to_play}
                </Text>
              </View>
              <View style={[styles.readinessBlock, { backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.md, padding: SPACING.md }]}>
                <Text style={styles.readinessBlockLabel}>Recommended narrative:</Text>
                <Text style={styles.readinessBlockText}>{gapAnalysis.interview_readiness.recommended_narrative}</Text>
              </View>
            </Card>

            {/* CTA to Study Plan */}
            <Button
              title="View My Study Plan →"
              onPress={() => navigation.navigate('StudyPlan')}
              size="lg"
              style={styles.studyPlanBtn}
            />
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { marginBottom: SPACING.lg },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.sm },
  matchOverall: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm },
  matchScore: { fontSize: 40, fontWeight: '800' },
  matchLabel: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
  loadingCard: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  loadingTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  loadingText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  radarCard: { alignItems: 'center', paddingVertical: SPACING.md, marginBottom: SPACING.md },
  chartLegend: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.textMuted, fontSize: 12 },
  breakdownList: { gap: SPACING.sm, marginBottom: SPACING.md },
  skillCard: { marginBottom: 0 },
  skillCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  skillCategoryName: { color: COLORS.white, fontSize: 14, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  levelBars: { gap: 6, marginBottom: SPACING.sm },
  levelBarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelBarLabel: { color: COLORS.textMuted, fontSize: 12, width: 60 },
  levelBarTrack: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  levelBarFill: { height: '100%', borderRadius: RADIUS.full },
  levelBarValue: { color: COLORS.text, fontSize: 13, fontWeight: '700', width: 24, textAlign: 'right' },
  gapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  gapLabel: { color: COLORS.textFaint, fontSize: 12 },
  gapValue: { fontSize: 13, fontWeight: '700' },
  expandedSection: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, gap: SPACING.md },
  evidenceBlock: { gap: 4 },
  evidenceLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  evidenceText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  subSkills: { gap: 6 },
  subSkillsHeader: { color: COLORS.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  subSkillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subSkillName: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  subSkillGap: { fontSize: 12, fontWeight: '700' },
  expandArrow: { color: COLORS.primary, fontSize: 12, textAlign: 'right', marginTop: 4 },
  section: { marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: SPACING.md },
  advantageCard: { marginBottom: SPACING.sm, borderWidth: 1 },
  advantageSkill: { color: COLORS.success, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  advantageWhy: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginBottom: SPACING.sm },
  leverageBox: { backgroundColor: COLORS.successBg, borderRadius: RADIUS.sm, padding: SPACING.sm, gap: 4 },
  leverageLabel: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  leverageText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  gapCard: { marginBottom: SPACING.sm, borderWidth: 1 },
  gapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  gapSkillName: { color: COLORS.danger, fontSize: 15, fontWeight: '700', flex: 1 },
  severityBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  severityText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  gapLevels: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  gapWhy: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginBottom: SPACING.sm },
  gapMeta: { flexDirection: 'row', gap: SPACING.md },
  gapMetaItem: { fontSize: 12, fontWeight: '600', color: COLORS.textFaint },
  readinessCard: { marginBottom: SPACING.lg, gap: SPACING.md },
  readinessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readinessLabel: { color: COLORS.textMuted, fontSize: 14 },
  readinessValue: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
  readinessBlock: { gap: 4 },
  readinessBlockLabel: { color: COLORS.textFaint, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  readinessBlockText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
  studyPlanBtn: { marginTop: SPACING.sm },
});
