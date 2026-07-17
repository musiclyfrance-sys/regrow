import { useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';
import { haptics } from '@/lib/haptics';
import type { AutopsyReport } from '@/lib/ai';
import { colors, radii, spacing } from '@/theme';

interface Chapter {
  key: string;
  eyebrow: string;
  title: string;
  /** Phrase clé surlignée (extraite du début du texte). */
  keyPhrase?: string;
  body?: string;
  kind: 'text' | 'flags' | 'plan';
}

interface Props {
  report: AutopsyReport;
  exName: string;
  /** Bouton final du dernier chapitre (ex. « Commencer le jour 1 »). */
  finalAction?: { label: string; onPress: () => void };
}

/** Coupe la première phrase (la phrase clé) du reste du texte. */
function splitKeyPhrase(text: string): { key: string; rest: string } {
  const match = text.match(/^(.+?[.!?])\s+([\s\S]*)$/);
  if (!match) return { key: text, rest: '' };
  return { key: match[1]!, rest: match[2]! };
}

/**
 * Le rapport en CHAPITRES — on feuillette au lieu de dérouler un mur de texte.
 * Chaque page : numéro de chapitre, titre, phrase clé surlignée en lavande,
 * puis le corps, aéré. Points de progression en haut, navigation en bas.
 */
export function ReportPager({ report, exName, finalAction }: Props) {
  // Largeur mesurée du CADRE (pas de la fenêtre) : les pages restent dans
  // l'écran quelle que soit la taille d'affichage.
  const [width, setWidth] = useState(0);
  const listRef = useRef<FlatList<Chapter>>(null);
  const [page, setPage] = useState(0);

  const chapters = useMemo<Chapter[]>(
    () => [
      {
        key: 'verdict',
        eyebrow: 'TON VERDICT',
        title: 'Pourquoi c’est vraiment fini.',
        keyPhrase: report.verdict_global,
        body: 'Garde cette phrase. C’est elle que tu reliras les soirs où ta mémoire essaiera de réécrire l’histoire.',
        kind: 'text',
      },
      {
        key: 'attachement',
        eyebrow: 'CHAPITRE 1 · 6',
        title: `Le style d'attachement de ${exName}`,
        ...splitToFields(report.attachement_ex),
        kind: 'text',
      },
      {
        key: 'pattern',
        eyebrow: 'CHAPITRE 2 · 6',
        title: 'Ta façon d’aimer',
        ...splitToFields(report.pattern_utilisatrice),
        kind: 'text',
      },
      {
        key: 'dynamique',
        eyebrow: 'CHAPITRE 3 · 6',
        title: 'La dynamique qui vous a tués',
        ...splitToFields(report.dynamique),
        kind: 'text',
      },
      {
        key: 'parts',
        eyebrow: 'CHAPITRE 4 · 6',
        title: 'Sa part et ta part',
        ...splitToFields(report.parts),
        kind: 'text',
      },
      {
        key: 'flags',
        eyebrow: 'CHAPITRE 5 · 6',
        title: 'Les red flags que tu avais vus',
        kind: 'flags',
      },
      {
        key: 'plan',
        eyebrow: 'CHAPITRE 6 · 6',
        title: 'Ton plan des 90 prochains jours',
        kind: 'plan',
      },
    ],
    [report, exName],
  );

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(chapters.length - 1, index));
    // L'état passe tout de suite : les boutons restent justes même si
    // l'événement de fin de défilement n'arrive pas (cas du web).
    setPage(clamped);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
    >
      {/* Points de progression. */}
      <View style={styles.dots}>
        {chapters.map((c, i) => (
          <View key={c.key} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {width > 0 && (
      <FlatList
        ref={listRef}
        data={chapters}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.key}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.x / width);
          if (p !== page) {
            haptics.tick();
            setPage(p);
          }
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <ScrollView
              contentContainerStyle={styles.page}
              showsVerticalScrollIndicator={false}
            >
              <AppText variant="caption" color={colors.accentWarm} style={styles.eyebrow}>
                {item.eyebrow}
              </AppText>
              <AppText variant="title">{item.title}</AppText>

              {item.kind === 'text' && (
                <>
                  {item.keyPhrase && (
                    <View style={styles.keyPhrase}>
                      <AppText variant="heading">{item.keyPhrase}</AppText>
                    </View>
                  )}
                  {item.body ? (
                    <AppText variant="bodyLarge" style={styles.body}>
                      {item.body}
                    </AppText>
                  ) : null}
                </>
              )}

              {item.kind === 'flags' && (
                <View style={styles.flags}>
                  {report.red_flags.map((rf, i) => (
                    <View key={i} style={styles.flagCard}>
                      <View style={styles.flagDot} />
                      <AppText variant="body" style={styles.flagText}>
                        {rf}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}

              {item.kind === 'plan' && (
                <View style={styles.plan}>
                  {report.plan_90_jours.map((phase, i) => (
                    <View key={i} style={styles.phaseItem}>
                      <View style={styles.phaseDotCol}>
                        <View style={styles.phaseDot} />
                        {i < report.plan_90_jours.length - 1 && (
                          <View style={styles.phaseLine} />
                        )}
                      </View>
                      <View style={styles.phaseContent}>
                        <AppText variant="bodyMedium" color={colors.primarySoft}>
                          {phase.phase}
                        </AppText>
                        <AppText variant="body" color={colors.textSecondary}>
                          {phase.objectif}
                        </AppText>
                        {phase.actions.map((a, j) => (
                          <AppText key={j} variant="body" style={styles.action}>
                            · {a}
                          </AppText>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      />
      )}

      {/* Navigation de chapitres. */}
      <View style={styles.nav}>
        {page > 0 ? (
          <PrimaryButton
            label="‹ Précédent"
            variant="ghost"
            fullWidth={false}
            onPress={() => goTo(page - 1)}
          />
        ) : (
          <View style={styles.navSpacer} />
        )}
        {page < chapters.length - 1 ? (
          <PrimaryButton
            label="Chapitre suivant ›"
            fullWidth={false}
            onPress={() => goTo(page + 1)}
          />
        ) : finalAction ? (
          <PrimaryButton
            label={finalAction.label}
            fullWidth={false}
            onPress={finalAction.onPress}
          />
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>
    </View>
  );
}

function splitToFields(text: string): { keyPhrase: string; body: string } {
  const { key, rest } = splitKeyPhrase(text);
  return { keyPhrase: key, body: rest };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
  },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  page: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  eyebrow: { letterSpacing: 1.5 },
  keyPhrase: {
    backgroundColor: colors.highlight,
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  body: { lineHeight: 27 },
  flags: { gap: spacing.md },
  flagCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginTop: 8,
  },
  flagText: { flex: 1 },
  plan: { gap: 0 },
  phaseItem: { flexDirection: 'row', gap: spacing.lg },
  phaseDotCol: { alignItems: 'center', width: 14 },
  phaseDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accentWarm,
    marginTop: 5,
  },
  phaseLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 3 },
  phaseContent: { flex: 1, gap: spacing.xs, paddingBottom: spacing.lg },
  action: { lineHeight: 23 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navSpacer: { width: 1 },
});
