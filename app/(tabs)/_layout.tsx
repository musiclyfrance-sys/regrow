import { Tabs } from 'expo-router';
import { TabIcon } from '@/components';
import { colors, spacing } from '@/theme';

/**
 * Les 5 onglets : Aujourd'hui (rituel) · Parcours (90 jours) · Bibliothèque
 * (contenus doux) · Progrès (courbe et stats) · Coffre.
 * Le rapport se rouvre depuis l'accueil et le parcours. Panic, check-in,
 * simulateur, capsule et réglages sont des modales.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: 'GeneralSans-Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Aujourd’hui',
          tabBarIcon: ({ color }) => <TabIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Parcours',
          tabBarIcon: ({ color }) => <TabIcon name="journey" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bibliothèque',
          tabBarIcon: ({ color }) => <TabIcon name="library" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progrès',
          tabBarIcon: ({ color }) => <TabIcon name="progress" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Coffre',
          tabBarIcon: ({ color }) => <TabIcon name="vault" color={color} />,
        }}
      />
    </Tabs>
  );
}
