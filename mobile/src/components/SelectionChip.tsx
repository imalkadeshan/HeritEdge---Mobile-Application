/**
 * SelectionChip — Reusable selection chip component
 *
 * Used for multi-select options like cultural interests.
 * Large touch targets for accessibility.
 */

import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../theme/colors';
import { borderRadius } from '../theme/layout';
import { spacing, touchTarget } from '../theme/spacing';

interface SelectionChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
}

export function SelectionChip({
  label,
  selected = false,
  style,
  ...props
}: SelectionChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      <AppText
        variant="label"
        color={selected ? colors.primary.contrast : colors.text.primary}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
});
