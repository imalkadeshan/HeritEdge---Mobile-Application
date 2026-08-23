/**
 * LoadingIndicator — Reusable loading component
 *
 * Full-screen or inline loading indicator with optional message.
 */

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface LoadingIndicatorProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingIndicator({ message, fullscreen = true }: LoadingIndicatorProps) {
  if (fullscreen) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        {message && (
          <AppText variant="body" color={colors.text.secondary} style={styles.message}>
            {message}
          </AppText>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.primary.main} />
      {message && (
        <AppText variant="caption" color={colors.text.secondary} style={styles.inlineMessage}>
          {message}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    marginTop: spacing.lg,
  },
  inlineMessage: {
    marginLeft: spacing.sm,
  },
});
