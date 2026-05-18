import { useEffect, useMemo, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type WheelPickerProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const itemHeight = 38;
const wheelHeight = itemHeight * 3;

export function WheelPicker({ items, value, onChange, placeholder }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const options = useMemo(() => (placeholder ? [placeholder, ...items] : items), [items, placeholder]);
  const selectedIndex = Math.max(0, options.indexOf(value || placeholder || options[0] || ''));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * itemHeight, animated: false });
  }, [selectedIndex]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    const nextValue = options[Math.max(0, Math.min(index, options.length - 1))];
    onChange(nextValue === placeholder ? '' : nextValue);
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.selection} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: selectedIndex * itemHeight }}
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {options.map((item, index) => {
          const selected = index === selectedIndex;
          const isPlaceholder = item === placeholder;
          return (
            <View key={`${item}-${index}`} style={styles.item}>
              <Text style={[styles.itemText, selected && styles.selectedText, isPlaceholder && styles.placeholderText]} numberOfLines={1}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: wheelHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  selection: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: itemHeight,
    height: itemHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainer,
    zIndex: 0,
  },
  scrollContent: {
    paddingVertical: itemHeight,
  },
  item: {
    height: itemHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  itemText: {
    color: colors.outline,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  placeholderText: {
    color: colors.outline,
  },
});
