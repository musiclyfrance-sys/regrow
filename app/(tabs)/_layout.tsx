import { Tabs } from 'expo-router';
import { AppText } from '@/components';
import { colors, spacing } from '@/theme';

/** Onglets principaux (post-achat). Panic et check-in sont des modales plein écran. */
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
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Aujourd’hui', tabBarIcon: () => <TabDot label="◆" /> }}
      />
      <Tabs.Screen
        name="journey"
        options={{ title: 'Glow-Up', tabBarIcon: () => <TabDot label="✦" /> }}
      />
      <Tabs.Screen
        name="vault"
        options={{ title: 'Coffre', tabBarIcon: () => <TabDot label="▣" /> }}
      />
    </Tabs>
  );
}

function TabDot({ label }: { label: string }) {
  return <AppText variant="body">{label}</AppText>;
}
