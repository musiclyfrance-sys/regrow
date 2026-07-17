import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { AppText, HealingCurve, PrimaryButton, ScreenContainer } from '@/components';
import { track } from '@/lib/analytics';
import {
  configurePurchases,
  getOffers,
  Offer,
  ProductId,
  purchase,
  restore,
} from '@/lib/purchases';
import { colors, motion, radii, spacing } from '@/theme';
import { useAppStore } from '@/state/appStore';
import { selectExName, useQuizStore } from '@/state/quizStore';

/**
 * Paywall — hard paywall, point unique de l'app. Toutes les features verrouillées
 * y renvoient. Prix issus de RevenueCat (jamais codés en dur).
 */
export default function PaywallScreen() {
  const router = useRouter();
  const setEntitled = useAppStore((s) => s.setEntitled);
  const profile = useQuizStore((s) => s.profile);
  const ex = selectExName({ profile });

  const [offers, setOffers] = useState<Record<ProductId, Offer> | null>(null);
  const [selected, setSelected] = useState<ProductId>('program_90'); // présélection
  const [showClose, setShowClose] = useState(false);
  const [introShown, setIntroShown] = useState(false);
  const [introSheet, setIntroSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track('paywall_viewed');
    configurePurchases().then(getOffers).then(setOffers);
    const t = setTimeout(() => setShowClose(true), motion.paywallCloseDelayMs);
    return () => clearTimeout(t);
  }, []);

  const selectOffer = (id: ProductId) => {
    setSelected(id);
    track('paywall_option_selected', { product: id });
  };

  const completePurchase = async (productId: ProductId) => {
    setBusy(true);
    track('paywall_purchase_started', { product: productId });
    const res = await purchase(productId);
    setBusy(false);
    if (res.status === 'success') {
      track('paywall_purchase_completed', { product: productId });
      setEntitled(true);
      router.replace('/post-purchase/account');
    } else if (res.status === 'cancelled') {
      // Rien : l'utilisatrice reste sur le paywall.
    } else {
      Alert.alert('Oups', res.message ?? "Le paiement n'a pas abouti. Réessaie.");
    }
  };

  const onCTA = () => completePurchase(selected);

  const onRestore = async () => {
    setBusy(true);
    const res = await restore();
    setBusy(false);
    if (res.status === 'success') {
      setEntitled(true);
      router.replace('/(tabs)/home');
    } else {
      Alert.alert('Restauration', res.message ?? 'Aucun achat trouvé.');
    }
  };

  const onCloseAttempt = () => {
    // À la PREMIÈRE tentative uniquement : proposer l'offre d'intro.
    if (!introShown) {
      setIntroShown(true);
      setIntroSheet(true);
      track('intro_offer_viewed');
      return;
    }
    track('paywall_dismissed');
    router.back();
  };

  const acceptIntro = async () => {
    setIntroSheet(false);
    track('intro_offer_purchased');
    await completePurchase('intro_weekly');
  };

  const refuseIntro = () => {
    setIntroSheet(false);
    track('paywall_dismissed');
    router.back();
  };

  const programSub = useMemo(() => 'Soit 3,75 € par semaine, accès complet 90 jours', []);

  return (
    <ScreenContainer padded={false}>
      {showClose && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.closeWrap}>
          <Pressable onPress={onCloseAttempt} hitSlop={12} accessibilityLabel="Fermer">
            <AppText variant="body" color={colors.textSecondary}>
              ✕
            </AppText>
          </Pressable>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Ton autopsie est prête.</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Et avec elle, le plan pour le sortir de ta tête. Jour après jour.
        </AppText>

        {/* Aperçu visuel — boucle ouverte. */}
        <View style={styles.preview}>
          <AppText variant="heading" color={colors.textPrimary} numberOfLines={3}>
            Le style d'attachement, la dynamique qui vous a tués, ta part, sa part…
          </AppText>
          <LinearGradient
            colors={['rgba(29,24,39,0)', colors.surface]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* La promesse : la courbe qui descend. */}
        <HealingCurve exName={ex} />
        <AppText variant="body" color={colors.textSecondary} style={styles.promise}>
          Ce n'est pas magique, c'est mécanique : chaque outil enlève un peu de
          la place qu'il occupe. Le no-contact assèche l'habitude, le check-in
          du soir désamorce les rechutes, le coffre met les souvenirs hors de
          portée. En 90 jours, le manque devient un souvenir.
        </AppText>

        {/* Ce qui l'attend, jour après jour. */}
        <View style={styles.journey}>
          {[
            { day: 'Ce soir', text: 'Tu lis ton rapport, tu comprends enfin, et rien que ça change la nuit.' },
            { day: 'Jours 1–14', text: "Chaque soir, 2 minutes de check-in. Les envies de lui écrire s'espacent, ton compteur grimpe." },
            { day: 'Jour 30', text: 'Tu réécoutes ta voix du premier jour, et tu mesures le chemin parcouru.' },
            { day: 'Jour 90', text: 'Le coffre s\'ouvre. Tu choisis : récupérer, ou brûler. Toi, tu es déjà ailleurs.' },
          ].map((step, i) => (
            <View key={step.day} style={styles.journeyRow}>
              <View style={styles.journeyDotCol}>
                <View style={[styles.journeyDot, i === 0 && styles.journeyDotNow]} />
                {i < 3 && <View style={styles.journeyLine} />}
              </View>
              <View style={styles.journeyContent}>
                <AppText variant="caption" color={colors.accentWarm}>
                  {step.day.toUpperCase()}
                </AppText>
                <AppText variant="body" color={colors.textPrimary}>
                  {step.text}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {/* Offres */}
        <View style={styles.offers}>
          <OfferCard
            title="Programme 90 jours"
            price={offers?.program_90.priceLabel ?? '—'}
            subtitle={programSub}
            badge="Le plus choisi"
            selected={selected === 'program_90'}
            onPress={() => selectOffer('program_90')}
          />
          <OfferCard
            title="Hebdomadaire"
            price={`${offers?.weekly.priceLabel ?? '—'} / sem.`}
            subtitle="Sans engagement, annulable en 2 taps"
            selected={selected === 'weekly'}
            onPress={() => selectOffer('weekly')}
          />
        </View>

        {/* Bénéfices */}
        <View style={styles.benefits}>
          {[
            'Ton rapport complet + le plan 90 jours taillé sur tes réponses',
            'Le check-in du soir et un insight nouveau chaque jour',
            'Le crash test de message, le coffre-fort et le compteur de jours',
          ].map((b) => (
            <View key={b} style={styles.benefitRow}>
              <View style={styles.benefitDot} />
              <AppText variant="body" style={styles.benefitText}>
                {b}
              </AppText>
            </View>
          ))}
        </View>

        {/* Témoignage */}
        <View style={styles.testimonial}>
          <AppText variant="caption" color={colors.accentWarm}>
            ★ 4,8 / 5
          </AppText>
          <AppText variant="body" color={colors.textPrimary} style={styles.testimonialText}>
            « J'ai compris en 8 minutes ce que 6 mois de rumination ne m'avaient pas donné. »
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Débloquer maintenant" onPress={onCTA} loading={busy} />
        <View style={styles.legalRow}>
          <Pressable onPress={onRestore}>
            <AppText variant="caption" color={colors.textSecondary}>
              Restaurer mes achats
            </AppText>
          </Pressable>
          <AppText variant="caption" color={colors.textSecondary}>
            Conditions · Confidentialité
          </AppText>
        </View>
      </View>

      {/* Feuille modale de l'offre d'introduction (1re tentative de fermeture). */}
      {introSheet && (
        <View style={styles.sheetScrim}>
          <Animated.View entering={SlideInDown.duration(280)} style={styles.sheet}>
            <AppText variant="heading" center>
              Attends une seconde.
            </AppText>
            <AppText variant="body" color={colors.textSecondary} center style={styles.sheetBody}>
              D'accord. Commence par une semaine à moitié prix, et vois si tu tiens 7 jours sans
              lui écrire.
            </AppText>
            <View style={styles.introPrice}>
              <AppText variant="title" color={colors.accentWarm}>
                {offers?.intro_weekly.priceLabel ?? '3,99 €'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                la première semaine, puis {offers?.weekly.priceLabel ?? '7,99 €'} / sem.
              </AppText>
            </View>
            <PrimaryButton label="Essayer une semaine" onPress={acceptIntro} />
            <Pressable onPress={refuseIntro} style={styles.introRefuse}>
              <AppText variant="caption" color={colors.textSecondary}>
                Non merci, fermer
              </AppText>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </ScreenContainer>
  );
}

function OfferCard({
  title,
  price,
  subtitle,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.offerCard, selected && styles.offerCardSelected]}>
      {badge && (
        <View style={styles.badge}>
          <AppText variant="caption" color={colors.background}>
            {badge}
          </AppText>
        </View>
      )}
      <View style={styles.offerRow}>
        <View style={styles.offerLeft}>
          <AppText variant="heading">{title}</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.offerSub}>
            {subtitle}
          </AppText>
        </View>
        <AppText variant="heading" color={selected ? colors.primary : colors.textPrimary}>
          {price}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeWrap: { position: 'absolute', top: spacing.sm, left: spacing.xxl, zIndex: 10 },
  scroll: { paddingHorizontal: 24, paddingTop: spacing.huge, paddingBottom: spacing.lg, gap: spacing.lg },
  subtitle: {},
  preview: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    overflow: 'hidden',
    height: 96,
  },
  promise: { lineHeight: 24 },
  journey: { gap: 0, marginVertical: spacing.sm },
  journeyRow: { flexDirection: 'row', gap: spacing.lg },
  journeyDotCol: { alignItems: 'center', width: 14 },
  journeyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceRaised,
    marginTop: 5,
  },
  journeyDotNow: { backgroundColor: colors.accentWarm },
  journeyLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 3 },
  journeyContent: { flex: 1, gap: 2, paddingBottom: spacing.lg },
  offers: { gap: spacing.md },
  offerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  offerCardSelected: { borderColor: colors.primary },
  offerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  offerLeft: { flex: 1, paddingRight: spacing.md },
  offerSub: { marginTop: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentWarm,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  benefits: { gap: spacing.md, marginTop: spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  benefitText: { flex: 1 },
  testimonial: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  testimonialText: {},
  footer: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sheetScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  sheetBody: {},
  introPrice: { alignItems: 'center', gap: spacing.xs },
  introRefuse: { alignItems: 'center', paddingTop: spacing.xs },
});
