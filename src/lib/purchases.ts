import { env, hasRevenueCat } from './env';

/**
 * Passerelle RevenueCat (react-native-purchases).
 *
 * En mode mock / sandbox sans clé : offres et achats simulés, avec les prix
 * exacts de la spec, pour développer tout le paywall sans compte RevenueCat.
 * Les prix affichés viennent TOUJOURS d'ici (jamais codés en dur dans l'écran).
 */

export type ProductId = 'program_90' | 'weekly' | 'intro_weekly';

export interface Offer {
  id: ProductId;
  priceLabel: string;
  /** Identifiant du package RevenueCat (réel). */
  packageId?: string;
}

export interface PurchaseResult {
  status: 'success' | 'cancelled' | 'error';
  productId?: ProductId;
  message?: string;
}

const MOCK_OFFERS: Record<ProductId, Offer> = {
  program_90: { id: 'program_90', priceLabel: '44,99 €' },
  weekly: { id: 'weekly', priceLabel: '7,99 €' },
  intro_weekly: { id: 'intro_weekly', priceLabel: '3,99 €' },
};

let configured = false;

export async function configurePurchases(): Promise<void> {
  if (env.mockMode || !hasRevenueCat) {
    configured = true;
    return;
  }
  const Purchases = (await import('react-native-purchases')).default;
  Purchases.configure({ apiKey: env.revenueCatApiKeyIos });
  configured = true;
}

/** Récupère les offres à afficher. En mock : prix de la spec. */
export async function getOffers(): Promise<Record<ProductId, Offer>> {
  if (env.mockMode || !hasRevenueCat) return MOCK_OFFERS;
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    const map = { ...MOCK_OFFERS };
    current?.availablePackages.forEach((pkg) => {
      const price = pkg.product.priceString;
      if (pkg.identifier.includes('program')) {
        map.program_90 = { id: 'program_90', priceLabel: price, packageId: pkg.identifier };
      } else if (pkg.identifier.includes('weekly')) {
        map.weekly = { id: 'weekly', priceLabel: price, packageId: pkg.identifier };
      }
    });
    return map;
  } catch {
    return MOCK_OFFERS;
  }
}

/** Lance l'achat. Gère succès / annulation / erreur / restauration. */
export async function purchase(productId: ProductId): Promise<PurchaseResult> {
  if (env.mockMode || !hasRevenueCat) {
    // Simule un achat sandbox réussi après un court délai.
    await new Promise((r) => setTimeout(r, 800));
    return { status: 'success', productId };
  }
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find((p) =>
      productId === 'program_90'
        ? p.identifier.includes('program')
        : p.identifier.includes('weekly'),
    );
    if (!pkg) return { status: 'error', message: 'Offre introuvable' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const entitled = Object.keys(customerInfo.entitlements.active).length > 0;
    return entitled
      ? { status: 'success', productId }
      : { status: 'error', message: 'Aucun accès activé' };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { status: 'cancelled' };
    return { status: 'error', message: err.message ?? 'Erreur inconnue' };
  }
}

/** Restaure les achats. */
export async function restore(): Promise<PurchaseResult> {
  if (env.mockMode || !hasRevenueCat) {
    await new Promise((r) => setTimeout(r, 500));
    return { status: 'error', message: 'Aucun achat à restaurer (mode démo).' };
  }
  try {
    const Purchases = (await import('react-native-purchases')).default;
    const info = await Purchases.restorePurchases();
    const entitled = Object.keys(info.entitlements.active).length > 0;
    return entitled ? { status: 'success' } : { status: 'error', message: 'Aucun achat trouvé' };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
}

export function isConfigured() {
  return configured;
}
