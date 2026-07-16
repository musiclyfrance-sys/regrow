import { useEffect, useRef } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { ShareCard, ShareCardVariant } from './ShareCard';

interface Props {
  variant: ShareCardVariant;
  value: number;
  date?: string;
  /** Appelé quand le partage est terminé (ou annulé). */
  onDone: () => void;
}

/**
 * Capture la carte en image (1080×1920) puis ouvre la feuille de partage iOS.
 * La carte est rendue hors écran le temps de la capture — invisible pour elle.
 */
export function ShareCardSheet({ variant, value, date, onDone }: Props) {
  const cardRef = useRef<View>(null);

  useEffect(() => {
    let cancelled = false;
    // Petit délai : laisser la carte se rendre entièrement avant capture.
    const t = setTimeout(async () => {
      try {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          width: 1080,
          height: 1920,
        });
        if (!cancelled) await Share.share({ url: uri });
      } catch {
        // Un échec de capture ne doit rien casser.
      } finally {
        if (!cancelled) onDone();
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.offscreen} pointerEvents="none">
      <ShareCard ref={cardRef} variant={variant} value={value} date={date} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Hors écran mais RENDU (opacity 0 casserait la capture sur certains iOS).
  offscreen: { position: 'absolute', left: -9999, top: 0 },
});
