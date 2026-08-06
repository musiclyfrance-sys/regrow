import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AppText, ScreenContainer } from '@/components';
import { LibraryIcon, LibraryIconName } from '@/components/LibraryIcon';
import { ARTICLES, QUOTES, SOUNDS } from '@/config/library';
import { haptics } from '@/lib/haptics';
import { colors, radii, spacing, tints, themedStyles } from '@/theme';

/** Citation du jour : stable sur la journée, change chaque soir. */
function quoteOfToday(): string {
  const day = Math.floor(Date.now() / 86_400_000);
  return QUOTES[day % QUOTES.length]!;
}

function Chevron({ color = colors.textSecondary }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="m9 5 7 7-7 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

interface QuickTileProps {
  icon: LibraryIconName;
  label: string;
  tint: string;
  color: string;
  onPress: () => void;
}

/** Pastille ronde + libellé, comme un raccourci évident. */
function QuickTile({ icon, label, tint, color, onPress }: QuickTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
    >
      <View style={[styles.quickCircle, { backgroundColor: tint }]}>
        <LibraryIcon name={icon} color={color} size={26} />
      </View>
      <AppText variant="caption" color={colors.textPrimary}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Bibliothèque — les contenus doux, organisés en blocs clairs :
 * raccourcis ronds, citation du soir, articles, sons relaxants.
 */
export default function LibraryScreen() {
  const router = useRouter();

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">Bibliothèque</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            Des outils doux pour les moments où ça tangue.
          </AppText>
        </View>

        {/* Raccourcis ronds : les 4 gestes du quotidien. */}
        <View style={styles.quickRow}>
          <QuickTile
            icon="breath"
            label="Respiration"
            tint={tints.lavender}
            color={colors.primarySoft}
            onPress={() => router.push('/breathe')}
          />
          <QuickTile
            icon="meditate"
            label="Méditer"
            tint={tints.sage}
            color={colors.success}
            onPress={() => router.push('/meditate')}
          />
          <QuickTile
            icon="quote"
            label="Citations"
            tint={tints.peach}
            color={colors.accentWarm}
            onPress={() => router.push('/quotes')}
          />
          <QuickTile
            icon="journal"
            label="Journal"
            tint={tints.lavender}
            color={colors.primary}
            onPress={() => router.push('/journal')}
          />
        </View>

        {/* Citation du soir. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            router.push('/quotes');
          }}
          style={({ pressed }) => [styles.quoteCard, pressed && styles.pressed]}
        >
          <AppText variant="caption" color={colors.accentWarm} style={styles.eyebrow}>
            LA PHRASE DE CE SOIR
          </AppText>
          <AppText variant="heading">{quoteOfToday()}</AppText>
        </Pressable>

        {/* Sons relaxants. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.selection();
            router.push('/sounds');
          }}
          style={({ pressed }) => [styles.soundCard, pressed && styles.pressed]}
        >
          <View style={styles.soundHeader}>
            <View>
              <AppText variant="heading">Sons relaxants</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Pour calmer la tête, ou t’endormir.
              </AppText>
            </View>
            <Chevron />
          </View>
          <View style={styles.soundRow}>
            {SOUNDS.map((s) => (
              <View key={s.id} style={styles.soundItem}>
                <View style={[styles.soundCircle, { backgroundColor: tints.cream }]}>
                  <LibraryIcon
                    name={s.id === 'pluie' ? 'rain' : s.id === 'ocean' ? 'ocean' : s.id === 'feu' ? 'fire' : 'moon'}
                    color={s.id === 'feu' ? colors.accentWarm : s.id === 'ocean' ? colors.success : colors.primarySoft}
                    size={22}
                  />
                </View>
                <AppText variant="caption" color={colors.textSecondary}>
                  {s.name}
                </AppText>
              </View>
            ))}
          </View>
        </Pressable>

        {/* Articles : tout comprendre, sans jargon. */}
        <View style={styles.section}>
          <AppText variant="heading">Pour comprendre</AppText>
          <View style={styles.articleList}>
            {ARTICLES.map((a, i) => (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                onPress={() => {
                  haptics.selection();
                  router.push({ pathname: '/article/[id]', params: { id: a.id } });
                }}
                style={({ pressed }) => [
                  styles.articleRow,
                  i < ARTICLES.length - 1 && styles.articleDivider,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.articleIcon, { backgroundColor: tints.lavender }]}>
                  <LibraryIcon name="article" color={colors.primarySoft} size={20} />
                </View>
                <View style={styles.articleText}>
                  <AppText variant="bodyMedium">{a.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Lecture de {a.minutes} minutes
                  </AppText>
                </View>
                <Chevron />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.xxl,
  },
  header: { gap: spacing.xs },
  pressed: { opacity: 0.85 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickTile: { alignItems: 'center', gap: spacing.sm, width: 72 },
  quickCircle: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: { letterSpacing: 1.2 },

  soundCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  soundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundRow: { flexDirection: 'row', justifyContent: 'space-between' },
  soundItem: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  soundCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: { gap: spacing.md },
  articleList: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  articleDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleText: { flex: 1, gap: 2 },
}));
