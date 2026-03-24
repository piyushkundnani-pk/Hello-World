import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { MCQQuestion, OpenEndedQuestion, MCQEvaluation, OpenEndedEvaluation } from '../types';

const DIFFICULTY_LABELS = ['', 'Easy', 'Medium', 'Hard', 'Expert'];
const DIFFICULTY_COLORS = ['', COLORS.success, COLORS.warning, COLORS.danger, '#9333ea'];

export const AssessmentScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const {
    currentSession,
    currentQuestionIndex,
    submitAnswer,
    nextQuestion,
    completeAssessment,
    generateResults,
    isLoading,
    loadingMessage,
    error,
    setError,
  } = useAppStore();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [openEndedAnswer, setOpenEndedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<MCQEvaluation | OpenEndedEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!currentSession) return null;

  const allQuestions = [...currentSession.mcqs, ...currentSession.open_ended];
  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isMCQ = currentQuestion?.type === 'mcq' || ('options' in (currentQuestion || {}));

  const handleTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleSubmitMCQ = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    try {
      await submitAnswer(selectedOption);
      // Get the evaluation from the store response
      const session = useAppStore.getState().currentSession;
      const lastResponse = session?.responses[session.responses.length - 1];
      setCurrentEvaluation(lastResponse?.evaluation as MCQEvaluation || null);
      setShowFeedback(true);
    } catch {
      // error in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOpenEnded = async () => {
    if (openEndedAnswer.trim().length < 20) {
      setError('Please write a more complete answer (at least a few sentences).');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await submitAnswer(openEndedAnswer);
      const session = useAppStore.getState().currentSession;
      const lastResponse = session?.responses[session.responses.length - 1];
      setCurrentEvaluation(lastResponse?.evaluation as OpenEndedEvaluation || null);
      setShowFeedback(true);
    } catch {
      // error in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    handleTransition(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      setOpenEndedAnswer('');
      setCurrentEvaluation(null);
      nextQuestion();
    });
  };

  const handleFinish = async () => {
    await completeAssessment();
    navigation.navigate('Results');
    // Start generating results in background
    generateResults().catch(console.error);
  };

  const renderMCQ = (q: MCQQuestion) => (
    <View>
      {/* Scenario */}
      {q.scenario && (
        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioLabel}>SCENARIO</Text>
          <Text style={styles.scenarioText}>{q.scenario}</Text>
        </View>
      )}

      {/* Question */}
      <Text style={styles.questionText}>{q.question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {q.options.map((opt) => {
          const isSelected = selectedOption === opt.label;
          const isCorrect = opt.is_correct;
          let optionStyle = styles.option;
          let labelStyle = styles.optionLabel;
          let textStyle = styles.optionText;

          if (showFeedback) {
            if (isCorrect) {
              optionStyle = { ...styles.option, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, color: COLORS.success };
            } else if (isSelected && !isCorrect) {
              optionStyle = { ...styles.option, ...styles.optionWrong };
              textStyle = { ...styles.optionText, color: COLORS.danger };
            } else {
              optionStyle = { ...styles.option, opacity: 0.5 };
            }
          } else if (isSelected) {
            optionStyle = { ...styles.option, ...styles.optionSelected };
            labelStyle = { ...styles.optionLabel, color: COLORS.white };
            textStyle = { ...styles.optionText, color: COLORS.white };
          }

          return (
            <TouchableOpacity
              key={opt.label}
              style={optionStyle}
              onPress={() => !showFeedback && setSelectedOption(opt.label)}
              activeOpacity={showFeedback ? 1 : 0.75}
            >
              <View style={[styles.optionLabelBox, isSelected && !showFeedback && { backgroundColor: COLORS.primary }]}>
                <Text style={labelStyle}>{opt.label}</Text>
              </View>
              <Text style={textStyle}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit / Feedback */}
      {!showFeedback ? (
        <Button
          title="Submit Answer →"
          onPress={handleSubmitMCQ}
          disabled={!selectedOption || isSubmitting}
          loading={isSubmitting}
          style={styles.submitBtn}
        />
      ) : (
        renderMCQFeedback(q, currentEvaluation as MCQEvaluation)
      )}
    </View>
  );

  const renderMCQFeedback = (q: MCQQuestion, evaluation: MCQEvaluation | null) => {
    if (!evaluation) return null;
    const isCorrect = evaluation.is_correct;
    return (
      <View>
        <View style={[styles.feedbackBanner, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackBannerIcon}>{isCorrect ? '✅' : '❌'}</Text>
          <Text style={[styles.feedbackBannerText, { color: isCorrect ? COLORS.success : COLORS.danger }]}>
            {isCorrect ? 'Correct!' : `Correct answer: ${evaluation.correct_answer}`}
          </Text>
        </View>

        <Card style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{evaluation.overall_explanation}</Text>

          {evaluation.common_mistake && (
            <>
              <Text style={[styles.explanationTitle, { marginTop: SPACING.md, color: COLORS.warning }]}>
                Common mistake:
              </Text>
              <Text style={styles.explanationText}>{evaluation.common_mistake}</Text>
            </>
          )}

          {evaluation.pro_tip && (
            <>
              <Text style={[styles.explanationTitle, { marginTop: SPACING.md, color: COLORS.primary }]}>
                Pro tip:
              </Text>
              <Text style={styles.explanationText}>{evaluation.pro_tip}</Text>
            </>
          )}
        </Card>
      </View>
    );
  };

  const renderOpenEnded = (q: OpenEndedQuestion) => (
    <View>
      {q.context && (
        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioLabel}>CONTEXT</Text>
          <Text style={styles.scenarioText}>{q.context}</Text>
        </View>
      )}

      <Text style={styles.questionText}>{q.question}</Text>

      <View style={styles.questionTypeBadge}>
        <Text style={styles.questionTypeText}>
          {q.question_type?.replace(/_/g, ' ').toUpperCase() || 'OPEN ENDED'}
          {' · '}Suggested: {q.time_suggested_minutes} min
        </Text>
      </View>

      {!showFeedback ? (
        <View>
          <TextInput
            style={styles.answerInput}
            multiline
            value={openEndedAnswer}
            onChangeText={setOpenEndedAnswer}
            placeholder="Write your answer here. Think out loud — structure your response, use specific examples, and acknowledge trade-offs..."
            placeholderTextColor={COLORS.textFaint}
            textAlignVertical="top"
          />
          <View style={styles.answerMeta}>
            <Text style={styles.wordCount}>
              {openEndedAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </Text>
            <Text style={styles.answerHint}>Aim for 150-300 words</Text>
          </View>
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
          <Button
            title="Submit for Evaluation →"
            onPress={handleSubmitOpenEnded}
            disabled={openEndedAnswer.trim().length < 20 || isSubmitting}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </View>
      ) : (
        renderOpenEndedFeedback(currentEvaluation as OpenEndedEvaluation)
      )}
    </View>
  );

  const renderOpenEndedFeedback = (evaluation: OpenEndedEvaluation | null) => {
    if (!evaluation) return null;
    const total = evaluation.scores.weighted_total;
    const signalColor = evaluation.recruiter_signal === 'Yes' ? COLORS.success :
                        evaluation.recruiter_signal === 'Maybe' ? COLORS.warning : COLORS.danger;

    return (
      <View>
        {/* Score header */}
        <View style={styles.scoreHeader}>
          <View style={styles.scoreBig}>
            <Text style={[styles.scoreNumber, {
              color: total >= 7 ? COLORS.success : total >= 5 ? COLORS.warning : COLORS.danger
            }]}>
              {total.toFixed(1)}
            </Text>
            <Text style={styles.scoreDenom}>/10</Text>
          </View>
          <View style={[styles.recruiterSignal, { borderColor: signalColor }]}>
            <Text style={[styles.recruiterSignalLabel, { color: signalColor }]}>
              Would advance: {evaluation.recruiter_signal}
            </Text>
          </View>
        </View>

        {/* Dimension scores */}
        <Card style={styles.scoresCard}>
          {Object.entries(evaluation.scores).filter(([k]) => k !== 'weighted_total').map(([key, val]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const score = val as number;
            const color = score >= 7 ? COLORS.success : score >= 5 ? COLORS.warning : COLORS.danger;
            return (
              <View key={key} style={styles.dimRow}>
                <Text style={styles.dimLabel}>{label}</Text>
                <View style={styles.dimBar}>
                  <View style={[styles.dimFill, { width: `${score * 10}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.dimScore, { color }]}>{score}</Text>
              </View>
            );
          })}
        </Card>

        {/* Detailed feedback */}
        <Card style={styles.feedbackCard}>
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackSectionLabel, { color: COLORS.success }]}>✅ What you did well:</Text>
            <Text style={styles.feedbackSectionText}>{evaluation.detailed_feedback.what_you_did_well}</Text>
          </View>
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackSectionLabel, { color: COLORS.warning }]}>🔶 What was missing:</Text>
            <Text style={styles.feedbackSectionText}>{evaluation.detailed_feedback.what_was_missing}</Text>
          </View>
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackSectionLabel, { color: COLORS.primary }]}>💡 What a great answer includes:</Text>
            <Text style={styles.feedbackSectionText}>{evaluation.detailed_feedback.what_a_great_answer_includes}</Text>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay
        visible={isLoading && !isSubmitting}
        message={loadingMessage || 'Processing...'}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          />
          <View style={styles.progressMeta}>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{isMCQ ? 'Multiple Choice' : 'Open Ended'}</Text>
            </View>
            {currentQuestion && (
              <Text style={[
                styles.difficulty,
                { color: DIFFICULTY_COLORS[(currentQuestion as MCQQuestion).difficulty || 2] }
              ]}>
                {DIFFICULTY_LABELS[(currentQuestion as MCQQuestion).difficulty || 2]}
              </Text>
            )}
          </View>
        </View>

        {/* Question content */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {currentQuestion && (
            isMCQ
              ? renderMCQ(currentQuestion as MCQQuestion)
              : renderOpenEnded(currentQuestion as OpenEndedQuestion)
          )}
        </Animated.View>

        {/* Navigation */}
        {showFeedback && (
          <View style={styles.navButtons}>
            {isLastQuestion ? (
              <Button
                title="See My Results →"
                onPress={handleFinish}
                size="lg"
                style={{ flex: 1 }}
              />
            ) : (
              <Button
                title="Next Question →"
                onPress={handleNext}
                style={{ flex: 1 }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  progressSection: { marginBottom: SPACING.lg, gap: SPACING.sm },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeChip: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  typeChipText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  difficulty: { fontSize: 12, fontWeight: '700' },
  scenarioBox: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  scenarioLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scenarioText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  questionText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
    marginBottom: SPACING.lg,
  },
  questionTypeBadge: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  questionTypeText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  optionsContainer: { gap: SPACING.sm, marginBottom: SPACING.md },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionCorrect: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
  },
  optionWrong: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
  },
  optionLabelBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  optionText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 20 },
  submitBtn: { marginTop: SPACING.sm },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  feedbackCorrect: { backgroundColor: COLORS.successBg, borderWidth: 1, borderColor: COLORS.success },
  feedbackWrong: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: COLORS.danger },
  feedbackBannerIcon: { fontSize: 20 },
  feedbackBannerText: { fontSize: 15, fontWeight: '700', flex: 1 },
  explanationCard: { marginBottom: SPACING.md },
  explanationTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  explanationText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  answerInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 180,
  },
  answerMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: SPACING.sm },
  wordCount: { color: COLORS.textFaint, fontSize: 11 },
  answerHint: { color: COLORS.textFaint, fontSize: 11, fontStyle: 'italic' },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  scoreBig: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  scoreNumber: { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  scoreDenom: { color: COLORS.textMuted, fontSize: 20 },
  recruiterSignal: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  recruiterSignalLabel: { fontSize: 13, fontWeight: '700' },
  scoresCard: { marginBottom: SPACING.md, gap: SPACING.sm },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dimLabel: { color: COLORS.textMuted, fontSize: 12, width: 90 },
  dimBar: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  dimFill: { height: '100%', borderRadius: RADIUS.full },
  dimScore: { fontSize: 12, fontWeight: '700', width: 20, textAlign: 'right' },
  feedbackCard: { marginBottom: SPACING.md, gap: SPACING.md },
  feedbackSection: { gap: 4 },
  feedbackSectionLabel: { fontSize: 13, fontWeight: '700' },
  feedbackSectionText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  navButtons: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
});
