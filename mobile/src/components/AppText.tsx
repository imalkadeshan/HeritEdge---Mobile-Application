/**
 * AppText — Reusable text component
 *
 * Applies consistent typography across the app.
 * Supports semantic variants for different contexts.
 */

import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize, fontWeight, lineHeight } from '../theme/typography';

type TextVariant = 'body' | 'bodySmall' | 'label' | 'labelSmall' | 'heading' | 'subheading' | 'title' | 'caption';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  labelSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  subheading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxl * lineHeight.tight,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxxl * lineHeight.tight,
  },
};

export function AppText({
  variant = 'body',
  color = colors.text.primary,
  align,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        variantStyles[variant],
        { color },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
