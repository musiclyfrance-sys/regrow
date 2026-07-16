import { Tabs } from 'expo-router';
import { TabIcon } from '@/components';
import { colors, spacing } from '@/theme';

/**
 * Les 5 onglets : Aujourd'hui (rituel) · Parcours (90 jours) · Rapport
 * (relire l'autopsie) · Progrès (courbe et stats) · Coffre.
 * Panic, check-in, simulateur, capsule et réglages sont des modales.
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
        name="rapport"
        options={{
          title: 'Rapport',
          tabBarIcon: ({ color }) => <TabIcon name="report" color={color} />,
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
