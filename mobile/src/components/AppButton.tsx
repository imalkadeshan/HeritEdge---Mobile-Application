/**
 * AppButton — Reusable button component
 *
 * Supports primary (red), secondary, outline, and ghost variants.
 * Minimum touch target: 44x44pt for accessibility.
 */

import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { borderRadius, buttonHeight } from '../theme/layout';
import { spacing } from '../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number }> = {
  sm: { height: buttonHeight.sm, paddingHorizontal: spacing.lg },
  md: { height: buttonHeight.md, paddingHorizontal: spacing.xl },
  lg: { height: buttonHeight.lg, paddingHorizontal: spacing.xxl },
};

export function AppButton({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        styles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? colors.primary.contrast : colors.primary.main}
        />
      ) : (
        <AppText
          variant="label"
          color={getTextColor(variant)}
          align="center"
        >
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

function getTextColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return colors.primary.contrast;
    case 'secondary':
      return colors.primary.contrast;
    case 'outline':
      return colors.primary.main;
    case 'ghost':
      return colors.primary.main;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.primary.light,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.disabled.background,
    borderColor: colors.disabled.background,
  },
});
