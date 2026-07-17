import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

export type TabIconName = 'today' | 'journey' | 'library' | 'report' | 'progress' | 'vault';

/**
 * Icônes vectorielles fines des onglets (jamais d'emoji en UI).
 * Trait 1.8, coins arrondis, 22 px — discrètes et lisibles.
 */
export function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  const stroke = { stroke: color, strokeWidth: 1.8, fill: 'none' as const };
  const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'today': // maison
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" {...stroke} {...round} />
        </Svg>
      );
    case 'journey': // drapeau de parcours
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M6 21V4" {...stroke} {...round} />
          <Path d="M6 5h11l-2.5 4L17 13H6" {...stroke} {...round} />
        </Svg>
      );
    case 'library': // livre ouvert
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 6.5C10.5 5 8.5 4.3 5.8 4.3c-.9 0-1.8.1-2.3.2v14c.5-.1 1.4-.2 2.3-.2 2.7 0 4.7.7 6.2 2.2 1.5-1.5 3.5-2.2 6.2-2.2.9 0 1.8.1 2.3.2v-14c-.5-.1-1.4-.2-2.3-.2-2.7 0-4.7.7-6.2 2.2Z" {...stroke} {...round} />
          <Path d="M12 6.5v14" {...stroke} {...round} />
        </Svg>
      );
    case 'report': // document
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Rect x={5} y={3.5} width={14} height={17} rx={2} {...stroke} />
          <Path d="M9 9h6M9 13h6M9 17h4" {...stroke} {...round} />
        </Svg>
      );
    case 'progress': // courbe qui monte
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Polyline points="4,17 9.5,11.5 13.5,14.5 20,7" {...stroke} {...round} />
          <Circle cx={20} cy={7} r={1.6} fill={color} />
        </Svg>
      );
    case 'vault': // cadenas
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Rect x={5} y={10.5} width={14} height={10} rx={2.5} {...stroke} />
          <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...stroke} {...round} />
          <Circle cx={12} cy={15.5} r={1.4} fill={color} />
        </Svg>
      );
  }
}
