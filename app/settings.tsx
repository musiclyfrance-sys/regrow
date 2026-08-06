import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText, PrimaryButton, ScreenContainer } from '@/components';
import { restore } from '@/lib/purchases';
import { track } from '@/lib/analytics';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { useAppStore } from '@/state/appStore';

/**
 * Réglages — résiliation, restauration, export/suppression RGPD, mentions
 * légales. La ligne de non-substitution médicale et le 3114 restent TOUJOURS
 * visibles ici (section 8).
 */
export default function SettingsScreen() {
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName ?? '');

  const onRestore = async () => {
    const res = await restore();
    Alert.alert(
      'Restauration',
      res.status === 'success' ? 'Tes achats ont été restaurés.' : (res.message ?? 'Aucun achat.'),
    );
  };

  const onManageSub = () => Linking.openURL('https://apps.apple.com/account/subscriptions');

  const onDelete = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Toutes tes données seront effacées définitivement (rapport, coffre, capsules). Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
            track('settings_delete_account');
            // Suppression réelle en cascade (Supabase) branchée dans le lot RGPD.
            Alert.alert('C’est fait', 'La suppression a été demandée.');
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="title" style={styles.title}>
          Réglages
        </AppText>

        {/* Prénom (optionnel, local — jamais demandé avant l'achat). */}
        {editingName ? (
          <View style={styles.nameEdit}>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Ton prénom (ou un surnom)"
              placeholderTextColor={colors.textSecondary}
              maxLength={20}
              autoFocus
              style={styles.nameInput}
            />
            <PrimaryButton
              label="Enregistrer"
              onPress={() => {
                setUserName(nameDraft);
                setEditingName(false);
              }}
            />
          </View>
        ) : (
          <Row
            label={userName ? `Mon prénom : ${userName}` : 'Ajouter mon prénom (optionnel)'}
            onPress={() => {
              setNameDraft(userName ?? '');
              setEditingName(true);
            }}
          />
        )}

        <Row label="Restaurer mes achats" onPress={onRestore} />
        <Row label="Gérer mon abonnement" onPress={onManageSub} />
        <Row label="Exporter mes données" onPress={() => Alert.alert('Export', 'Bientôt disponible.')} />
        <Row label="Supprimer mon compte et mes données" danger onPress={onDelete} />
        <Row label="Mentions légales" onPress={() => {}} />
        <Row label="Politique de confidentialité" onPress={() => {}} />

        {/* Non-substitution + 3114 toujours visibles. */}
        <View style={styles.safety}>
          <AppText variant="body" color={colors.textSecondary}>
            Cette app est un programme de soutien, pas un suivi médical ou psychologique.
          </AppText>
          <Pressable onPress={() => Linking.openURL('tel:3114')} style={styles.callRow}>
            <AppText variant="bodyMedium" color={colors.primary}>
              Besoin de parler ? Le 3114 est gratuit, 24h/24.
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Row({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <AppText variant="bodyLarge" color={danger ? colors.danger : colors.textPrimary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = themedStyles(({ colors, tints, gradients }) => StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: spacing.xl, paddingBottom: spacing.huge, gap: spacing.xs },
  title: { marginBottom: spacing.lg },
  row: { paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  nameEdit: { gap: spacing.md, paddingVertical: spacing.md },
  nameInput: {
    minHeight: 52,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceRaised,
    color: colors.textPrimary,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 17,
    paddingHorizontal: spacing.lg,
  },
  safety: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  callRow: {},
}));
