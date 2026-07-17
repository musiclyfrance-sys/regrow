import { useState } from 'react';
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
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { LibraryIcon } from '@/components/LibraryIcon';
import { track } from '@/lib/analytics';
import { detectsDistress } from '@/lib/distress';
import { haptics } from '@/lib/haptics';
import { JOURNAL_PROMPTS, JournalEntry, useJournalStore } from '@/state/journalStore';
import { colors, fonts, radii, spacing, tints, themedStyles } from '@/theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Journal — l'endroit où écrire ce qu'on n'enverra pas.
 * Tout reste sur le téléphone. Rien ne part sur un serveur.
 */
export default function JournalScreen() {
  const router = useRouter();
  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState('');

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Sécurité détresse : on vérifie localement, sans jamais logguer le contenu.
    if (detectsDistress(trimmed)) {
      addEntry(trimmed);
      setText('');
      setWriting(false);
      router.push('/ressources');
      return;
    }
    haptics.streak();
    addEntry(trimmed);
    track('journal_entry_added');
    setText('');
    setWriting(false);
  };

  if (writing) {
    return (
      <ScreenContainer>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.editorHeader}>
            <AppText variant="title">Écris, ça reste ici.</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Personne ne lira jamais ces lignes, pas même lui.
            </AppText>
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Tout ce qui tourne dans ta tête…"
            placeholderTextColor={colors.textSecondary}
            style={styles.editor}
            multiline
            autoFocus
            maxLength={4000}
          />

          {!text.trim() && (
            <View style={styles.prompts}>
              {JOURNAL_PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  onPress={() => {
                    haptics.soft();
                    setText(`${p}\n\n`);
                  }}
                  style={({ pressed }) => [styles.promptPill, pressed && styles.pressed]}
                >
                  <AppText variant="caption" color={colors.primarySoft}>
                    {p}
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.editorActions}>
            <PrimaryButton
              label="Annuler"
              variant="ghost"
              fullWidth={false}
              style={styles.editorBtn}
              onPress={() => {
                setText('');
                setWriting(false);
              }}
            />
            <PrimaryButton
              label="Garder"
              disabled={!text.trim()}
              fullWidth={false}
              style={styles.editorBtn}
              onPress={save}
            />
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <AppText variant="title">Ton journal</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Ce que tu écris ici reste sur ton téléphone.
        </AppText>
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: tints.lavender }]}>
            <LibraryIcon name="journal" color={colors.primarySoft} size={28} />
          </View>
          <AppText variant="heading" center>
            Ta première page t’attend.
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center style={styles.emptyBody}>
            Écrire le message sans l’envoyer, c’est le garder pour toi. C’est souvent
            tout ce dont on a besoin.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e: JournalEntry) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <AppText variant="caption" color={colors.accentWarm} style={styles.entryDate}>
                {formatDate(item.createdAt)}
              </AppText>
              <AppText variant="body">{item.text}</AppText>
            </View>
          )}
        />
      )}

      <View style={styles.bottomActions}>
        <PrimaryButton
          label="Écrire"
          onPress={() => {
            haptics.selection();
            setWriting(true);
          }}
        />
        <PrimaryButton label="‹ Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenContainer>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  header: { paddingHorizontal: 24, marginTop: spacing.xl, gap: spacing.xs },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: { paddingHorizontal: spacing.lg },

  list: { padding: 24, paddingBottom: 160, gap: spacing.md },
  entry: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  entryDate: { letterSpacing: 0.6, textTransform: 'capitalize' },

  editorHeader: { marginTop: spacing.xl, gap: spacing.xs },
  editor: {
    flex: 1,
    marginTop: spacing.xl,
    color: colors.textPrimary,
    fontFamily: fonts.sansRegular,
    fontSize: 17,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  prompts: { gap: spacing.sm, marginBottom: spacing.md },
  promptPill: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  editorActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  editorBtn: { flex: 1 },

  bottomActions: {
    position: 'absolute',
    bottom: spacing.huge,
    left: 24,
    right: 24,
    gap: spacing.md,
  },
}));
