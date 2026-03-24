import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { ParsedResume } from '../types';

const PLACEHOLDER = `Paste your resume here...

Example:
John Doe | john@example.com | LinkedIn: linkedin.com/in/johndoe

EXPERIENCE
Senior Software Engineer — Acme Corp (2019–2024)
• Led development of recommendation engine serving 2M users
• Collaborated with PM team on product roadmap...

EDUCATION
B.Tech Computer Science — IIT Bombay (2019)

SKILLS
Python, SQL, System Design, Agile, JIRA...`;

export const ResumeUploadScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { parseResume, parseResumePDF, parsedResume, isLoading, loadingMessage, error, setError } = useAppStore();
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [resumeText, setResumeText] = useState('');
  const [pdfName, setPdfName] = useState('');

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];
      setPdfName(file.name);

      await parseResumePDF(file.uri, file.name);
    } catch (err) {
      setError('Failed to read PDF. Please try pasting the text instead.');
    }
  };

  const handleParseText = async () => {
    if (resumeText.trim().length < 100) {
      setError('Please paste your full resume (at least a few paragraphs).');
      return;
    }
    await parseResume(resumeText);
  };

  const handleContinue = () => {
    navigation.navigate('JobPosting');
  };

  const renderParsedProfile = (resume: ParsedResume) => (
    <Card style={styles.profileCard} highlighted>
      <View style={styles.profileHeader}>
        <Text style={styles.checkmark}>✅</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{resume.candidate_name || 'Your Profile'}</Text>
          <Text style={styles.profileRole}>{resume.current_role}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{resume.years_of_experience.total}y</Text>
          <Text style={styles.statLabel}>Total Exp</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{resume.years_of_experience.in_product_management}y</Text>
          <Text style={styles.statLabel}>PM Exp</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{resume.resume_quality_score}/10</Text>
          <Text style={styles.statLabel}>Resume Score</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.statLevel]}>
            {resume.seniority_level.charAt(0).toUpperCase() + resume.seniority_level.slice(1)}
          </Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      {resume.transition_indicator.is_transitioning && (
        <View style={styles.transitionBadge}>
          <Text style={styles.transitionText}>
            🔄 Transitioning from {resume.transition_indicator.from_role}
          </Text>
        </View>
      )}

      <View style={styles.recruiterNote}>
        <Text style={styles.recruiterNoteLabel}>Recruiter's First Impression:</Text>
        <Text style={styles.recruiterNoteText}>{resume.recruiter_notes}</Text>
      </View>

      <Text style={styles.skillsHeader}>Detected PM Skills:</Text>
      <View style={styles.skillsGrid}>
        {Object.entries(resume.pm_skills_demonstrated).map(([key, val]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
          const level = val.estimated_level;
          const color = level >= 4 ? COLORS.success : level >= 3 ? COLORS.warning : COLORS.danger;
          return (
            <View key={key} style={styles.skillChip}>
              <Text style={styles.skillChipLabel}>{label}</Text>
              <Text style={[styles.skillChipLevel, { color }]}>Lv {level}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={isLoading} message={loadingMessage || 'Analyzing your resume...'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 2</Text>
          <Text style={styles.title}>Upload Your Resume</Text>
          <Text style={styles.subtitle}>
            AI will extract your PM skills, experience, and areas of strength to calibrate your assessment.
          </Text>
        </View>

        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        {!parsedResume ? (
          <>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, inputMode === 'text' && styles.modeBtnActive]}
                onPress={() => setInputMode('text')}
              >
                <Text style={[styles.modeBtnText, inputMode === 'text' && styles.modeBtnTextActive]}>
                  📝 Paste Text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, inputMode === 'pdf' && styles.modeBtnActive]}
                onPress={() => setInputMode('pdf')}
              >
                <Text style={[styles.modeBtnText, inputMode === 'pdf' && styles.modeBtnTextActive]}>
                  📄 Upload PDF
                </Text>
              </TouchableOpacity>
            </View>

            {inputMode === 'text' ? (
              <View>
                <TextInput
                  style={styles.textInput}
                  multiline
                  value={resumeText}
                  onChangeText={setResumeText}
                  placeholder={PLACEHOLDER}
                  placeholderTextColor={COLORS.textFaint}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{resumeText.length} chars</Text>
                <Button
                  title="Analyze Resume →"
                  onPress={handleParseText}
                  disabled={resumeText.trim().length < 100}
                  style={styles.analyzeBtn}
                />
              </View>
            ) : (
              <View style={styles.pdfSection}>
                <TouchableOpacity style={styles.uploadZone} onPress={handlePickPDF}>
                  <Text style={styles.uploadIcon}>📄</Text>
                  <Text style={styles.uploadTitle}>
                    {pdfName || 'Tap to select PDF'}
                  </Text>
                  <Text style={styles.uploadSub}>Max 10MB · PDF only</Text>
                </TouchableOpacity>
                {pdfName && !parsedResume && (
                  <Button
                    title="Parse PDF →"
                    onPress={handlePickPDF}
                    style={styles.analyzeBtn}
                  />
                )}
              </View>
            )}
          </>
        ) : (
          <>
            {renderParsedProfile(parsedResume)}
            <View style={styles.actionRow}>
              <Button
                title="Re-upload"
                onPress={() => useAppStore.getState().setParsedResume(null as unknown as ParsedResume)}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <Button
                title="Continue →"
                onPress={handleContinue}
                style={{ flex: 2 }}
              />
            </View>
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  modeBtnTextActive: { color: COLORS.white },
  textInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 220,
    fontFamily: 'monospace',
  },
  charCount: { color: COLORS.textFaint, fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: SPACING.md },
  analyzeBtn: { marginTop: SPACING.sm },
  pdfSection: { gap: SPACING.md },
  uploadZone: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
  },
  uploadIcon: { fontSize: 48 },
  uploadTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  uploadSub: { color: COLORS.textFaint, fontSize: 13 },
  profileCard: { marginBottom: SPACING.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  checkmark: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  profileRole: { color: COLORS.textMuted, fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  stat: { alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  statLevel: { fontSize: 14 },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  transitionBadge: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  transitionText: { color: COLORS.warning, fontSize: 13, fontWeight: '600' },
  recruiterNote: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  recruiterNoteLabel: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  recruiterNoteText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
  skillsHeader: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: SPACING.sm },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 4,
  },
  skillChipLabel: { color: COLORS.textMuted, fontSize: 11 },
  skillChipLevel: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
});
