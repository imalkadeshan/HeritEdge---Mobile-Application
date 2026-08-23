/**
 * AppCard — Reusable card component
 *
 * Surface container for content with consistent styling.
 * Supports optional onPress for interactive cards.
 */

import {
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius } from '../theme/layout';
import { spacing } from '../theme/spacing';

interface AppCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

export function AppCard({
  children,
  variant = 'default',
  style,
  ...props
}: AppCardProps) {
  const isInteractive = !!props.onPress;

  if (isInteractive) {
    return (
      <TouchableOpacity
        style={[styles.base, styles[variant], style]}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  default: {
    backgroundColor: colors.surface.primary,
  },
  elevated: {
    backgroundColor: colors.surface.elevated,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
