/**
 * AppInput — Reusable text input component
 *
 * Large touch targets, clear labels, accessible design.
 * Supports optional label and error message.
 */

import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { borderRadius, inputHeight } from '../theme/layout';
import { spacing } from '../theme/spacing';
import { fontSize } from '../theme/typography';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && (
        <AppText variant="caption" color={colors.error.main} style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xxs,
  },
  input: {
    height: inputHeight.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.surface.primary,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  error: {
    marginTop: spacing.xxs,
  },
});
