/**
 * AppHeader — Reusable header component
 *
 * Simple header with optional back button and title.
 * Designed for accessibility with large touch targets.
 */

import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { iconSize } from '../theme/layout';
import { touchTarget } from '../theme/spacing';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function AppHeader({ title, onBack, rightAction }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
          >
            <AppText variant="heading" color={colors.text.primary}>
              ‹
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <AppText variant="heading" align="center" style={styles.title}>
        {title}
      </AppText>

      <View style={styles.side}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: touchTarget.recommended,
  },
  side: {
    width: touchTarget.recommended,
    alignItems: 'center',
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
});
