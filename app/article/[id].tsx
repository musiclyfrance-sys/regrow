import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { AppText, ScreenContainer } from '@/components';
import { ARTICLES } from '@/config/library';
import { track } from '@/lib/analytics';
import { colors, spacing, themedStyles } from '@/theme';

/**
 * Lecture d'un article — typographie généreuse, sections courtes,
 * pensé pour une lecture au lit sans effort.
 */
export default function ArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = ARTICLES.find((a) => a.id === id);

  // Paramètre inconnu (lien profond cassé) : retour à un écran sûr.
  if (!article) return <Redirect href="/(tabs)/library" />;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            track('article_closed', { article: article.id });
            router.back();
          }}
          hitSlop={12}
          accessibilityLabel="Retour"
          style={styles.backBtn}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="m14 6-6 6 6 6"
              stroke={colors.textPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color={colors.accentWarm} style={styles.eyebrow}>
          {`LECTURE DE ${article.minutes} MINUTES`}
        </AppText>
        <AppText variant="title">{article.title}</AppText>

        {article.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            {section.heading && <AppText variant="heading">{section.heading}</AppText>}
            {section.paragraphs.map((p, j) => (
              <AppText key={j} variant="bodyLarge" color={colors.textPrimary} style={styles.para}>
                {p}
              </AppText>
            ))}
          </View>
        ))}

        <AppText variant="body" color={colors.textSecondary} style={styles.footer}>
          Tu viens de prendre trois minutes pour toi. C’est exactement ça, le programme.
        </AppText>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backBtn: { padding: spacing.sm, alignSelf: 'flex-start' },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  eyebrow: { letterSpacing: 1.2 },
  section: { gap: spacing.md, marginTop: spacing.sm },
  para: { lineHeight: 27 },
  footer: { marginTop: spacing.xl, fontStyle: 'italic' },
}));
