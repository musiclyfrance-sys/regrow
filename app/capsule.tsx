import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import {
  AppText,
  BreathingCircle,
  CountUpText,
  PrimaryButton,
  ScreenContainer,
} from '@/components';
import { track } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radii, spacing } from '@/theme';
import { useAppStore } from '@/state/appStore';
import {
  selectReadyCapsule,
  selectSealedCapsule,
  useCapsuleStore,
} from '@/state/capsuleStore';

const MAX_SECONDS = 60;

/**
 * La Capsule — elle parle à la elle de dans 30 jours. 60 secondes max.
 * Scellée dès l'arrêt, inaccessible, restituée à J+30 avec une invitation à
 * enregistrer la suivante.
 */
export default function CapsuleScreen() {
  const router = useRouter();
  const hasAccount = useAppStore((s) => s.hasAccount);
  const capsules = useCapsuleStore((s) => s.capsules);
  const addCapsule = useCapsuleStore((s) => s.addCapsule);
  const markPlayed = useCapsuleStore((s) => s.markPlayed);

  const ready = selectReadyCapsule(capsules);
  const sealed = selectSealedCapsule(capsules);

  const [mode, setMode] = useState<'intro' | 'recording' | 'sealed' | 'playing'>(
    ready ? 'playing' : sealed ? 'sealed' : 'intro',
  );
  const [seconds, setSeconds] = useState(0);
  const [denied, setDenied] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      recording.current?.stopAndUnloadAsync().catch(() => {});
      sound.current?.unloadAsync().catch(() => {});
    },
    [],
  );

  // ─────────── Enregistrement ───────────
  const startRecording = async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      setDenied(true);
      return;
    }
    setDenied(false);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recording.current = rec;
    setSeconds(0);
    setMode('recording');
    haptics.selection();
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) stopRecording();
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (timer.current) clearInterval(timer.current);
    const rec = recording.current;
    if (!rec) return;
    recording.current = null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (uri) {
        addCapsule(uri);
        track('capsule_recorded');
        haptics.soft();
      }
    } catch {
      /* enregistrement trop court : on ignore */
    }
    setMode('sealed');
  };

  // ─────────── Lecture (J+30 atteint) ───────────
  const play = async () => {
    if (!ready) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    const { sound: s } = await Audio.Sound.createAsync({ uri: ready.uri });
    sound.current = s;
    s.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        markPlayed(ready.uri);
        track('capsule_played');
        haptics.soft();
        setMode('intro'); // invitation à enregistrer la suivante
      }
    });
    await s.playAsync();
  };

  // ─────────── Rendus ───────────

  if (mode === 'playing' && ready) {
    const recordedDate = new Date(ready.recordedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
    return (
      <ScreenContainer center>
        <View style={styles.center}>
          <AppText variant="caption" color={colors.accentWarm} center style={styles.label}>
            QUELQU'UN VEUT TE PARLER
          </AppText>
          <AppText variant="title" center>
            C'est toi, le {recordedDate}.
          </AppText>
          <Pressable onPress={play} accessibilityLabel="Écouter ma capsule">
            <BreathingCircle size={140} color={colors.primary}>
              <AppText variant="buttonLabel" color={colors.background}>
                Écouter
              </AppText>
            </BreathingCircle>
          </Pressable>
        </View>
        <View style={styles.bottom}>
          <PrimaryButton label="Pas encore prête" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (mode === 'sealed') {
    const unlockDate = sealed
      ? new Date(sealed.unlockAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
      : '';
    return (
      <ScreenContainer center>
        <View style={styles.center}>
          <AppText style={styles.sealIcon}>✉️</AppText>
          <AppText variant="title" center>
            Ta capsule est scellée.
          </AppText>
          <AppText variant="bodyLarge" color={colors.textSecondary} center>
            Elle te reviendra le {unlockDate}. D'ici là, personne ne peut
            l'écouter — pas même toi.
          </AppText>
        </View>
        <View style={styles.bottom}>
          <PrimaryButton label="Retour" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  if (mode === 'recording') {
    return (
      <ScreenContainer center>
        <View style={styles.center}>
          <BreathingCircle size={170} color={colors.danger} scaleTo={1.06} durationMs={1200}>
            <CountUpText value={seconds} durationMs={200} style={styles.timer} />
            <AppText variant="caption" color={colors.textPrimary}>
              / {MAX_SECONDS} s
            </AppText>
          </BreathingCircle>
          <AppText variant="body" color={colors.textSecondary} center>
            Parle-lui. Elle t'écoutera dans 30 jours.
          </AppText>
        </View>
        <View style={styles.bottom}>
          <PrimaryButton label="Sceller ma capsule" onPress={stopRecording} />
        </View>
      </ScreenContainer>
    );
  }

  // intro
  return (
    <ScreenContainer center>
      <View style={styles.center}>
        <AppText variant="caption" color={colors.accentWarm} center style={styles.label}>
          LA CAPSULE
        </AppText>
        <AppText variant="title" center>
          Dis à la toi de dans 3 mois ce que tu ressens là, maintenant.
        </AppText>
        <AppText variant="body" color={colors.textSecondary} center>
          60 secondes, une seule prise. Scellée dès que tu t'arrêtes, rendue
          dans 30 jours. C'est la preuve du chemin que tu vas faire.
        </AppText>
        {!hasAccount && (
          <View style={styles.accountHint}>
            <AppText variant="body" color={colors.textPrimary}>
              Sécurise ton espace avant d'enregistrer : sans compte, ta capsule
              peut être perdue si tu changes de téléphone.
            </AppText>
            <Pressable onPress={() => router.push('/post-purchase/account')}>
              <AppText variant="bodyMedium" color={colors.primary}>
                Créer mon espace sécurisé →
              </AppText>
            </Pressable>
          </View>
        )}
        {denied && (
          <AppText variant="body" color={colors.danger} center accessibilityRole="alert">
            Le micro est désactivé. Pour l'autoriser : Réglages → Regrow → Micro.
          </AppText>
        )}
      </View>
      <View style={styles.bottom}>
        <PrimaryButton label="Enregistrer ma capsule" onPress={startRecording} />
        <PrimaryButton label="Plus tard" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.sm },
  label: { letterSpacing: 2 },
  bottom: { position: 'absolute', bottom: spacing.xl, left: 24, right: 24, gap: spacing.md },
  sealIcon: { fontSize: 40, lineHeight: 48 },
  timer: {
    fontFamily: fonts.serifSemibold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  accountHint: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
});
