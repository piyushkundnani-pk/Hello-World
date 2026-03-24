import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: '📄', title: 'Resume Analysis', desc: 'AI extracts your PM skills from your experience' },
  { icon: '🎯', title: 'JD-Specific Assessment', desc: '10 MCQs + 2 open-ended questions calibrated to the role' },
  { icon: '📊', title: 'Skill Radar', desc: 'Visual gap analysis vs job requirements' },
  { icon: '📚', title: 'Study Plan', desc: 'Personalized prep plan to close your gaps' },
];

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();

  return (
    <LinearGradient colors={[COLORS.bg, '#0d1b3e']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Hero */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.appName}>PM SkillForge</Text>
          <Text style={styles.tagline}>
            Paste any PM job posting + your resume{'\n'}→ Get a personalized assessment calibrated to YOU
          </Text>
        </View>

        {/* Value Props */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Calibration Note */}
        <View style={styles.honestBox}>
          <Text style={styles.honestTitle}>Built for honest self-assessment</Text>
          <Text style={styles.honestText}>
            This isn't a feel-good quiz. The AI evaluates like a real PM hiring manager — direct, calibrated, and actionable.
          </Text>
        </View>

        {/* CTA */}
        <Button
          title="Start My Assessment →"
          onPress={() => navigation.navigate('ResumeUpload')}
          size="lg"
          style={styles.cta}
        />

        <Text style={styles.timeEst}>⏱ Quick Assessment takes ~15 minutes</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + 16,
    paddingBottom: SPACING.xxl,
  },
  hero: { alignItems: 'center', marginBottom: SPACING.xl },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoIcon: { fontSize: 36 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  featureDesc: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18 },
  honestBox: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  honestTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  honestText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  cta: { marginBottom: SPACING.md },
  timeEst: {
    textAlign: 'center',
    color: COLORS.textFaint,
    fontSize: 13,
  },
});
