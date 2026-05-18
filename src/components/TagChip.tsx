import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type TagChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function TagChip({ label, selected = false, onPress, style }: TagChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.defaultChip,
        !onPress && styles.staticChip,
        style,
      ]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  defaultChip: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
  },
  selectedChip: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  staticChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.onPrimaryContainer,
  },
});
