import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { haptics } from '@/lib/haptics';

/**
 * Micro-encouragements — affichés sous la barre à des étapes clés.
 * Le sentiment de progression, sans jamais un pourcentage.
 */
const ENCOURAGEMENTS: Record<number, string> = {
  6: 'Les faits sont posés, on passe aux habitudes.',
  12: 'Tu avances vite. Continue sur ta lancée.',
  20: 'Déjà un bon tiers. Ton profil se précise.',
  27: 'Plus de la moitié. Le plus dur est fait.',
  34: 'Les réponses s’assemblent. Ça prend forme.',
  40: 'Dernière ligne droite. Ton plan se construit.',
  45: 'Encore trois questions. Ton rapport est presque prêt.',
};
import {
  AppText,
  EmotionScale,
  PillOption,
  PrimaryButton,
  QuizProgress,
  ScreenContainer,
} from '@/components';
import { QUIZ } from '@/config/quiz';
import { PHASE_LABELS, QuestionStep } from '@/config/quizTypes';
import { track } from '@/lib/analytics';
import { colors, fonts, motion, radii, spacing } from '@/theme';
import {
  AnswerValue,
  resolveText,
  selectExName,
  useQuizStore,
} from '@/state/quizStore';

/**
 * Moteur de quiz — piloté à 100 % par la config (QUIZ).
 * Un seul choix / une seule action par écran. Persistance à chaque réponse,
 * reprise exacte. Le slide horizontal + fondu vient du layout d'onboarding.
 */
export default function QuizStepScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step: string }>();
  const idx = Number(step);

  const answers = useQuizStore((s) => s.answers);
  const profile = useQuizStore((s) => s.profile);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const goTo = useQuizStore((s) => s.goTo);
  const exName = selectExName({ profile });

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimer(), []);
  const clearTimer = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };

  // Progression basée sur le nombre de questions franchies.
  const questionsBefore = useMemo(
    () =>
      QUIZ.slice(0, Math.max(0, idx)).filter((s) => s.kind === 'question').length,
    [idx],
  );
  // Nombre de questions par phase (les 4 segments de la barre).
  const segments = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (const s of QUIZ) {
      if (s.kind === 'question') counts[s.phase - 1]! += 1;
    }
    return counts;
  }, []);

  const goNext = useCallback(() => {
    clearTimer();
    const nextIdx = idx + 1;
    goTo(nextIdx);
    if (nextIdx >= QUIZ.length) {
      track('quiz_completed');
      router.replace('/onboarding/analysis');
      return;
    }
    router.push({ pathname: '/onboarding/quiz/[step]', params: { step: String(nextIdx) } });
  }, [idx, goTo, router]);

  // Retour : revient à la QUESTION précédente (jamais dans un interlude
  // auto-avançant), réponse déjà cochée, prête à être corrigée.
  const prevQuestionIdx = useMemo(() => {
    for (let i = idx - 1; i >= 0; i--) {
      if (QUIZ[i]?.kind === 'question') return i;
    }
    return null;
  }, [idx]);

  const goBack = useCallback(() => {
    clearTimer();
    haptics.selection();
    // Première question : retour à l'écran d'ouverture (jamais bloquée).
    if (prevQuestionIdx == null) {
      router.replace('/onboarding/hook');
      return;
    }
    goTo(prevQuestionIdx);
    router.replace({
      pathname: '/onboarding/quiz/[step]',
      params: { step: String(prevQuestionIdx) },
    });
  }, [prevQuestionIdx, goTo, router]);

  // Célébration discrète à chaque changement de phase.
  const prevPhaseRef = useRef<number | null>(null);
  useEffect(() => {
    const step = QUIZ[idx];
    const phase = step?.kind === 'question' ? step.phase : null;
    if (phase != null && prevPhaseRef.current != null && phase > prevPhaseRef.current) {
      haptics.soft();
    }
    if (phase != null) prevPhaseRef.current = phase;
  }, [idx]);

  if (Number.isNaN(idx) || idx < 0 || idx >= QUIZ.length) {
    return <Redirect href="/onboarding/hook" />;
  }

  const current = QUIZ[idx]!;

  // ─────────────── Interlude (micro-verdict / social proof / stat) ───────────
  if (current.kind === 'interlude') {
    return (
      <InterludeView
        key={current.id}
        title={current.title}
        body={current.compute ? current.compute(answers, exName) : resolveText(current.body, exName)}
        author={current.author}
        variant={current.variant}
        autoAdvanceMs={current.autoAdvanceMs}
        onContinue={goNext}
        phaseLabel={PHASE_LABELS[current.phase]}
        questionsDone={questionsBefore}
        segments={segments}
      />
    );
  }

  // ─────────────── Question ───────────────
  const q = current;
  const value = answers[q.id] ?? null;

  const handleSingle = (optValue: string) => {
    setAnswer(q, optValue);
    // Avance automatique après 350 ms, sans bouton Suivant.
    advanceTimer.current = setTimeout(goNext, motion.autoAdvanceMs);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          accessibilityLabel="Question précédente"
          style={styles.backBtn}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M14.5 5.5 8 12l6.5 6.5"
              stroke={colors.textSecondary}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
        <View style={styles.progressWrap}>
          <QuizProgress
            questionsDone={questionsBefore + 1}
            segments={segments}
            phaseLabel={PHASE_LABELS[q.phase]}
            encouragement={ENCOURAGEMENTS[q.step]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(motion.quizTransitionMs)}>
            <AppText variant="title" style={styles.prompt}>
              {resolveText(q.prompt, exName)}
            </AppText>
            {q.helper && (
              <AppText variant="body" color={colors.textSecondary} style={styles.helper}>
                {resolveText(q.helper, exName)}
              </AppText>
            )}
          </Animated.View>

          <View style={styles.body}>
            <QuestionBody
              q={q}
              value={value}
              onSingle={handleSingle}
              onSet={(v) => setAnswer(q, v)}
              exName={exName}
            />
          </View>
        </ScrollView>

        <ContinueBar q={q} value={value} onContinue={goNext} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─────────────── Corps de question selon le type ───────────────
function QuestionBody({
  q,
  value,
  onSingle,
  onSet,
  exName,
}: {
  q: QuestionStep;
  value: AnswerValue;
  onSingle: (v: string) => void;
  onSet: (v: AnswerValue) => void;
  exName: string;
}) {
  const reduceMotion = useReduceMotion();
  // Les pilules arrivent en cascade (45 ms d'écart) : l'écran se construit
  // sous ses yeux au lieu d'apparaître d'un bloc.
  const Cascade = ({ index, children }: { index: number; children: React.ReactNode }) =>
    reduceMotion ? (
      <View>{children}</View>
    ) : (
      <Animated.View entering={FadeInDown.delay(80 + index * 45).duration(260)}>
        {children}
      </Animated.View>
    );

  switch (q.type) {
    case 'single': {
      const options = [
        ...(q.options ?? []),
        ...(q.allowOther
          ? [{ value: '__other', label: 'Autre / aucune de ces réponses' }]
          : []),
      ];
      return (
        <View style={styles.options}>
          {options.map((o, i) => (
            <Cascade key={o.value} index={i}>
              <PillOption
                label={resolveText(o.label, exName)}
                selected={value === o.value}
                onPress={() => onSingle(o.value)}
              />
            </Cascade>
          ))}
        </View>
      );
    }

    case 'multiple': {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (v: string) =>
        onSet(
          selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
        );
      return (
        <View style={styles.options}>
          {q.options?.map((o, i) => (
            <Cascade key={o.value} index={i}>
              <PillOption
                multiple
                label={resolveText(o.label, exName)}
                selected={selected.includes(o.value)}
                onPress={() => toggle(o.value)}
              />
            </Cascade>
          ))}
        </View>
      );
    }

    case 'scale':
      return (
        <View style={styles.scale}>
          <EmotionScale
            value={typeof value === 'number' ? value : null}
            onChange={(v) => onSet(v)}
            max={q.scaleMax ?? 5}
            labels={q.scaleLabels}
          />
        </View>
      );

    case 'text':
      return (
        <TextInput
          value={typeof value === 'string' ? value : ''}
          onChangeText={(t) => onSet(t)}
          placeholder={q.placeholder}
          placeholderTextColor={colors.textSecondary}
          maxLength={q.maxLength}
          autoFocus
          returnKeyType="done"
          style={styles.input}
        />
      );

    case 'date':
      // MVP : présets rapides (aucun module natif requis). Optionnel → « Passer ».
      return (
        <View style={styles.options}>
          {['Dans ~1 mois', 'Dans ~3 mois', 'Dans ~6 mois', 'Je ne sais pas encore'].map(
            (label, i) => {
              const v = ['1m', '3m', '6m', 'unknown'][i]!;
              return (
                <PillOption
                  key={v}
                  label={label}
                  selected={value === v}
                  onPress={() => onSet(v)}
                />
              );
            },
          )}
        </View>
      );

    default:
      return null;
  }
}

// ─────────────── Barre « Continuer » (types sans avance auto) ───────────────
function ContinueBar({
  q,
  value,
  onContinue,
}: {
  q: QuestionStep;
  value: AnswerValue;
  onContinue: () => void;
}) {
  // Le choix unique avance tout seul → pas de barre.
  if (q.type === 'single') return null;

  const hasValue =
    q.type === 'multiple'
      ? Array.isArray(value) && value.length > 0
      : value != null && value !== '';
  const canContinue = hasValue || q.optional;

  return (
    <View style={styles.continueBar}>
      <PrimaryButton
        label={q.optional && !hasValue ? 'Passer' : 'Continuer'}
        onPress={onContinue}
        disabled={!canContinue}
      />
    </View>
  );
}

// ─────────────── Vue interlude ───────────────
function InterludeView({
  title,
  body,
  author,
  variant,
  autoAdvanceMs,
  onContinue,
  phaseLabel,
  questionsDone,
  segments,
}: {
  title?: string;
  body: string;
  author?: string;
  variant: 'micro_verdict' | 'social_proof' | 'stat';
  autoAdvanceMs?: number;
  onContinue: () => void;
  phaseLabel: string;
  questionsDone: number;
  segments: number[];
}) {
  const [showButton] = useState(!autoAdvanceMs);

  useEffect(() => {
    if (variant === 'social_proof') track('quiz_micro_verdict_viewed', { variant });
    else track('quiz_micro_verdict_viewed', { variant });
    if (autoAdvanceMs) {
      const t = setTimeout(onContinue, autoAdvanceMs);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenContainer
      center
      backgroundColor={colors.surface}
    >
      <View style={styles.interludeTop}>
        <QuizProgress
          questionsDone={questionsDone}
          segments={segments}
          phaseLabel={phaseLabel}
        />
      </View>

      <Animated.View entering={FadeIn.duration(500)} style={styles.interludeContent}>
        {title ? (
          <AppText variant="display" center style={styles.interludeTitle}>
            {title}
          </AppText>
        ) : null}
        <AppText
          variant={variant === 'social_proof' ? 'heading' : 'bodyLarge'}
          center
          color={variant === 'social_proof' ? colors.textPrimary : colors.textSecondary}
          style={styles.interludeBody}
        >
          {body}
        </AppText>
        {author ? (
          <AppText variant="caption" center color={colors.primarySoft} style={styles.author}>
            {author}
          </AppText>
        ) : null}
      </Animated.View>

      {showButton && (
        <View style={styles.interludeButton}>
          <PrimaryButton label="Continuer" onPress={onContinue} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  backBtn: { paddingTop: 2, marginLeft: -spacing.sm },
  progressWrap: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  prompt: { marginBottom: spacing.sm },
  helper: { marginBottom: spacing.lg },
  body: { marginTop: spacing.xl },
  options: { gap: spacing.md },
  scale: { marginTop: spacing.huge, paddingHorizontal: spacing.sm },
  input: {
    minHeight: 56,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceRaised,
    color: colors.textPrimary,
    fontFamily: fonts.sansMedium,
    fontSize: 20,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  continueBar: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  interludeTop: {
    position: 'absolute',
    top: spacing.huge,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  interludeContent: { gap: spacing.lg, paddingHorizontal: spacing.sm },
  interludeTitle: {},
  interludeBody: {},
  author: { marginTop: spacing.sm, letterSpacing: 0.4 },
  interludeButton: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
  },
});
