import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppText, PillOption, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import { detectsDistress } from '@/lib/distress';
import { haptics } from '@/lib/haptics';
import {
  ChatMessage,
  MAX_EXCHANGES,
  simulatorReply,
  usedThisWeek,
  useSimulatorQuota,
  WEEKLY_QUOTA,
} from '@/lib/simulator';
import { colors, fonts, radii, spacing } from '@/theme';
import { selectExName, useQuizStore } from '@/state/quizStore';
import { selectStreakDays, useStreakStore } from '@/state/streakStore';

type Phase = 'gate' | 'chat' | 'debrief' | 'summary' | 'quota';

/**
 * Le simulateur : une conversation avec « une simulation de l'ex » qui montre,
 * sans cruauté, que cette conversation n'apporterait pas ce qu'elle espère.
 * Garde-fous : quota 3/semaine, 12 échanges max, avertissement obligatoire,
 * détection de détresse à chaque message, debrief obligatoire.
 */
export default function SimulatorScreen() {
  const router = useRouter();
  const profile = useQuizStore((s) => s.profile);
  const answers = useQuizStore((s) => s.answers);
  const ex = selectExName({ profile });

  const sessions = useSimulatorQuota((s) => s.sessions);
  const registerSession = useSimulatorQuota((s) => s.registerSession);
  const used = usedThisWeek(sessions);
  const remaining = Math.max(0, WEEKLY_QUOTA - used);

  const startDate = useStreakStore((s) => s.startDate);
  const lastContactDate = useStreakStore((s) => s.lastContactDate);
  const streak = selectStreakDays({ startDate, lastContactDate });

  const [phase, setPhase] = useState<Phase>(remaining > 0 ? 'gate' : 'quota');

  useEffect(() => {
    if (phase === 'quota') track('simulator_quota_reached');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [debriefStep, setDebriefStep] = useState(0);
  const [debriefAnswers, setDebriefAnswers] = useState<string[]>([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const startChat = () => {
    registerSession();
    track('simulator_started');
    setPhase('chat');
  };

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    // Garde-fou détresse sur CHAQUE message, avant tout envoi.
    if (detectsDistress(text)) {
      router.replace('/ressources');
      return;
    }

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setTyping(true);

    const reply = await simulatorReply(next, {
      ex,
      patterns: answers['exPatterns'] ?? [],
    });
    setTyping(false);

    if (reply.safetyExit) {
      router.replace('/ressources');
      return;
    }

    setMessages([...next, { role: 'assistant', content: reply.text }]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    // 12 échanges max : le simulateur conclut, puis debrief obligatoire.
    if (reply.closing) {
      haptics.soft();
      setTimeout(() => setPhase('debrief'), 1800);
    }
  };

  const DEBRIEF_QUESTIONS = [
    'Tu as obtenu ce que tu cherchais ?',
    'Qu’est-ce que ça t’a fait ?',
    'Tu veux toujours lui écrire en vrai ?',
  ];
  const DEBRIEF_OPTIONS = [
    ['Oui', 'Pas vraiment', 'Pas du tout'],
    ['Ça m’a apaisée', 'Ça m’a remuée', 'Ça m’a réveillée'],
    ['Oui, encore', 'Moins qu’avant', 'Non. Plus maintenant'],
  ];

  const answerDebrief = (answer: string) => {
    const nextAnswers = [...debriefAnswers, answer];
    setDebriefAnswers(nextAnswers);
    if (debriefStep < DEBRIEF_QUESTIONS.length - 1) {
      setDebriefStep(debriefStep + 1);
    } else {
      track('simulator_completed');
      setPhase('summary');
    }
  };

  // ─────────────── Rendus par phase ───────────────

  if (phase === 'quota') {
    return (
      <ScreenContainer center>
        <View style={styles.centerContent}>
          <AppText variant="title" center>
            Plus de simulation cette semaine.
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            C'est voulu : le simulateur est un outil de crise, pas une habitude.
            Il se recharge au fil des jours.
          </AppText>
        </View>
        <View style={styles.bottomBar}>
          <PrimaryButton label="Retour" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (phase === 'gate') {
    return (
      <ScreenContainer center>
        <View style={styles.centerContent}>
          <AppText variant="caption" color={colors.accentWarm} center style={styles.gateLabel}>
            LE CRASH TEST
          </AppText>
          <AppText variant="title" center>
            Écris-lui ici. Pas là-bas.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center>
            Le message que tu brûles d'envoyer à {ex}, envoie-le ici d'abord.
            D'après tout ce que tu m'as raconté — sa façon de fuir, ses réponses
            floues — je te montre comment la conversation finirait vraiment.
          </AppText>
          <AppText variant="body" color={colors.textPrimary} center>
            Tu gardes ta streak. Tu perds juste l'illusion.
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} center>
            Il te reste {remaining} crash test{remaining > 1 ? 's' : ''} cette semaine
          </AppText>
        </View>
        <View style={styles.bottomBar}>
          <PrimaryButton label="Tester mon message" onPress={startChat} />
          <PrimaryButton label="Finalement non" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (phase === 'debrief') {
    return (
      <ScreenContainer center>
        <Animated.View key={debriefStep} entering={FadeIn.duration(250)} style={styles.centerContent}>
          <AppText variant="caption" color={colors.textSecondary} center>
            DEBRIEF · {debriefStep + 1}/3
          </AppText>
          <AppText variant="title" center>
            {DEBRIEF_QUESTIONS[debriefStep]}
          </AppText>
          <View style={styles.debriefOptions}>
            {DEBRIEF_OPTIONS[debriefStep]!.map((o) => (
              <PillOption key={o} label={o} selected={false} onPress={() => answerDebrief(o)} />
            ))}
          </View>
        </Animated.View>
      </ScreenContainer>
    );
  }

  if (phase === 'summary') {
    return (
      <ScreenContainer center>
        <View style={styles.centerContent}>
          <AppText variant="title" center>
            Et pendant tout ce temps…
          </AppText>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryStreak}>{streak}</AppText>
            <AppText variant="body" color={colors.textSecondary} center>
              {streak > 1 ? 'jours' : 'jour'} sans contact. Ta streak est intacte.
              Tu as eu la conversation sans rien casser.
            </AppText>
          </View>
        </View>
        <View style={styles.bottomBar}>
          <PrimaryButton label="Retour à ma vie" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  // ─────────────── Chat ───────────────
  const exchangesLeft = MAX_EXCHANGES - messages.filter((m) => m.role === 'user').length;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.chatHeader}>
        <Pressable onPress={() => setPhase('debrief')} hitSlop={12}>
          <AppText variant="body" color={colors.textSecondary}>✕</AppText>
        </Pressable>
        <AppText variant="bodyMedium">{ex} · prédiction</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {exchangesLeft}
        </AppText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleThem,
              ]}
            >
              <AppText variant="body" color={colors.textPrimary}>
                {item.content}
              </AppText>
            </View>
          )}
          ListFooterComponent={
            typing ? (
              <View style={[styles.bubble, styles.bubbleThem]}>
                <AppText variant="body" color={colors.textSecondary}>…</AppText>
              </View>
            ) : null
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écris ce que tu lui dirais…"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={send}
            disabled={!input.trim() || typing}
            style={[styles.sendBtn, (!input.trim() || typing) && styles.sendBtnOff]}
            accessibilityLabel="Envoyer"
          >
            <AppText variant="buttonLabel" color={colors.background}>↑</AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerContent: { gap: spacing.lg, paddingHorizontal: spacing.sm, width: '100%' },
  gateLabel: { letterSpacing: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatList: { padding: 24, gap: spacing.md, flexGrow: 1 },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.surfaceRaised },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceRaised,
    color: colors.textPrimary,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { opacity: 0.4 },
  debriefOptions: { gap: spacing.md, marginTop: spacing.md, width: '100%' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryStreak: {
    fontFamily: fonts.serifSemibold,
    fontSize: 56,
    lineHeight: 62,
    color: colors.accentWarm,
  },
});
