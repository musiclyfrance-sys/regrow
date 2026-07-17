import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { LibraryIcon, LibraryIconName } from '@/components/LibraryIcon';
import { SLEEP_TIMERS_MIN, SOUNDS, SoundId } from '@/config/library';
import { haptics } from '@/lib/haptics';
import { playSound, playingSoundId, setSleepTimer, stopSound } from '@/lib/soundPlayer';
import { colors, radii, spacing, tints } from '@/theme';

const ICONS: Record<SoundId, LibraryIconName> = {
  pluie: 'rain',
  ocean: 'ocean',
  feu: 'fire',
  nuit: 'moon',
};

const ACCENTS: Record<SoundId, string> = {
  pluie: colors.primarySoft,
  ocean: colors.success,
  feu: colors.accentWarm,
  nuit: colors.primary,
};

/**
 * Sons relaxants — une boucle à la fois, minuterie de sommeil.
 * Le son continue quand on quitte l'écran, il s'arrête avec la minuterie.
 */
export default function SoundsScreen() {
  const router = useRouter();
  const [playing, setPlaying] = useState<SoundId | null>(playingSoundId());
  const [timerMin, setTimerMin] = useState<number>(30);

  // Reflète l'état réel si on revient sur l'écran pendant une lecture.
  useEffect(() => {
    setPlaying(playingSoundId());
  }, []);

  const toggle = async (id: SoundId) => {
    haptics.selection();
    const result = await playSound(id, timerMin);
    setPlaying(result === 'playing' ? id : null);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="title">Sons relaxants</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Choisis une ambiance, pose ton téléphone, ferme les yeux.
        </AppText>
      </View>

      <View style={styles.grid}>
        {SOUNDS.map((s) => {
          const active = playing === s.id;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={s.name}
              accessibilityState={{ selected: active }}
              onPress={() => toggle(s.id)}
              style={({ pressed }) => [
                styles.tile,
                active && styles.tileActive,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.tileIcon,
                  { backgroundColor: active ? ACCENTS[s.id] : tints.cream },
                ]}
              >
                <LibraryIcon
                  name={ICONS[s.id]}
                  color={active ? colors.background : ACCENTS[s.id]}
                  size={24}
                />
              </View>
              <AppText variant="bodyMedium">{s.name}</AppText>
              <AppText variant="caption" color={colors.textSecondary} center>
                {active ? 'En cours. Touche pour arrêter.' : s.hint}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.timerBlock}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.timerLabel}>
          S’ARRÊTE TOUT SEUL APRÈS
        </AppText>
        <View style={styles.timerRow}>
          {SLEEP_TIMERS_MIN.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => {
                haptics.soft();
                setTimerMin(m);
                // Minuterie changée pendant une lecture : on la remplace sans couper.
                if (playing) setSleepTimer(m);
              }}
              style={[styles.timerPill, timerMin === m && styles.timerPillActive]}
            >
              <AppText
                variant="bodyMedium"
                color={timerMin === m ? colors.background : colors.textPrimary}
              >
                {m === 0 ? 'Jamais' : `${m} min`}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.bottomActions}>
        {playing && (
          <PrimaryButton
            label="Arrêter le son"
            variant="ghost"
            onPress={async () => {
              await stopSound();
              setPlaying(null);
            }}
          />
        )}
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  pressed: { opacity: 0.85 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tileActive: { borderColor: colors.primary },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBlock: { marginTop: spacing.xxl, gap: spacing.md },
  timerLabel: { letterSpacing: 1.2 },
  timerRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  timerPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
  },
  timerPillActive: { backgroundColor: colors.primary },
  bottomActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
});
