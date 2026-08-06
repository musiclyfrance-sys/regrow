import Svg, { Circle, Path } from 'react-native-svg';

export type LibraryIconName =
  | 'breath'
  | 'meditate'
  | 'quote'
  | 'journal'
  | 'article'
  | 'sound'
  | 'rain'
  | 'ocean'
  | 'fire'
  | 'moon'
  | 'report';

interface Props {
  name: LibraryIconName;
  color: string;
  size?: number;
}

/**
 * Icônes vectorielles fines de la Bibliothèque (jamais d'emoji en UI).
 * Trait 1.8, coins arrondis, cohérentes avec TabIcon.
 */
export function LibraryIcon({ name, color, size = 24 }: Props) {
  const stroke = { stroke: color, strokeWidth: 1.8, fill: 'none' as const };
  const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'breath': // filets de vent
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 8h9.5a2.5 2.5 0 1 0-2.4-3.2" {...stroke} {...round} />
          <Path d="M3 12.5h14a2.6 2.6 0 1 1-2.5 3.4" {...stroke} {...round} />
          <Path d="M3 17h6.5a2.2 2.2 0 1 1-2.1 2.8" {...stroke} {...round} />
        </Svg>
      );
    case 'meditate': // personne assise
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={6} r={2.4} {...stroke} />
          <Path d="M12 9.5v4.5" {...stroke} {...round} />
          <Path d="M12 14c-2.8 0-5 1.6-5.8 3.6-.3.8.3 1.4 1.1 1.4h9.4c.8 0 1.4-.6 1.1-1.4C17 15.6 14.8 14 12 14Z" {...stroke} {...round} />
          <Path d="M7 12.5 4.5 14M17 12.5 19.5 14" {...stroke} {...round} />
        </Svg>
      );
    case 'quote': // guillemets
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9.5 7.5c-2.4.6-4 2.4-4 5v3.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H7.6c.2-1.6 1.1-2.7 2.5-3.3Z" {...stroke} {...round} />
          <Path d="M19 7.5c-2.4.6-4 2.4-4 5v3.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-1.9c.2-1.6 1.1-2.7 2.5-3.3Z" {...stroke} {...round} />
        </Svg>
      );
    case 'journal': // carnet et plume
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 18.5v-14Z" {...stroke} {...round} />
          <Path d="M8.5 3v17" {...stroke} />
          <Path d="M12 12.5l4.2-4.2M12.6 13.1l-1.6.5.5-1.6" {...stroke} {...round} />
        </Svg>
      );
    case 'article': // page avec lignes
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h6.8L18 6.7V19.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-15Z" {...stroke} {...round} />
          <Path d="M14 3v4h4" {...stroke} {...round} />
          <Path d="M9 12h6M9 15.5h6" {...stroke} {...round} />
        </Svg>
      );
    case 'sound': // ondes
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 10v4M8 7v10M12 4.5v15M16 7v10M20 10v4" {...stroke} {...round} />
        </Svg>
      );
    case 'rain': // nuage et gouttes
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M7 13.5a3.5 3.5 0 0 1 .4-7 4.4 4.4 0 0 1 8.5 1.1A3 3 0 0 1 16.8 13.5H7Z" {...stroke} {...round} />
          <Path d="M8.5 16.5 7.5 19M12.5 16.5l-1 2.5M16.5 16.5l-1 2.5" {...stroke} {...round} />
        </Svg>
      );
    case 'ocean': // vagues
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 9.5c1.5-1.6 3.5-1.6 5 0s3.5 1.6 5 0 3.5-1.6 5 0 2.5 1.1 3 .8" {...stroke} {...round} />
          <Path d="M3 14.5c1.5-1.6 3.5-1.6 5 0s3.5 1.6 5 0 3.5-1.6 5 0 2.5 1.1 3 .8" {...stroke} {...round} />
        </Svg>
      );
    case 'fire': // flamme
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3.5c.6 2.6 2.2 4 3.7 5.6A6.4 6.4 0 0 1 18 13.6 6 6 0 0 1 6 13.6c0-2.5 1.3-4 2.6-5.5.9-1 1.9-2.2 2.3-3.7.3-.5.9-.6 1.1-.9Z" {...stroke} {...round} />
          <Path d="M12 20a3.2 3.2 0 0 1-3.2-3.2c0-1.5 1-2.3 1.9-3.2.6-.6 1-1.2 1.3-2 .3.8.7 1.4 1.3 2 .9.9 1.9 1.7 1.9 3.2A3.2 3.2 0 0 1 12 20Z" {...stroke} {...round} />
        </Svg>
      );
    case 'moon': // croissant et étoile
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M19.5 14.5A8 8 0 0 1 9.5 4.4a8 8 0 1 0 10 10.1Z" {...stroke} {...round} />
          <Path d="M17 5.5v3M15.5 7h3" {...stroke} {...round} />
        </Svg>
      );
    case 'report': // document
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5.5 5A1.5 1.5 0 0 1 7 3.5h10A1.5 1.5 0 0 1 18.5 5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5Z" {...stroke} />
          <Path d="M9 9h6M9 13h6M9 17h4" {...stroke} {...round} />
        </Svg>
      );
  }
}
