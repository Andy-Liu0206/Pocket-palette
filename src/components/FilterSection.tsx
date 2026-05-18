import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryGroups } from '../data/categories';
import { taiwanAreas } from '../data/taiwanAreas';
import { colors, radius, shadow, spacing } from '../theme';
import type { RestaurantStatus } from '../types/restaurant';
import { TagChip } from './TagChip';
import { WheelPicker } from './WheelPicker';

export type ListFilters = {
  city: string;
  district: string;
  tags: string[];
  rating: string;
  status: string;
};

type FilterSectionProps = {
  filters: ListFilters;
  onChange: (filters: ListFilters) => void;
};

const statuses: RestaurantStatus[] = ['尚未去過', '已去過', '我的最愛'];

export function FilterSection({ filters, onChange }: FilterSectionProps) {
  const districts = filters.city ? taiwanAreas[filters.city] ?? [] : [];
  const toggleTag = (tag: string) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((current) => current !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: nextTags });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>篩選條件</Text>

      <Text style={styles.label}>地區</Text>
      <View style={styles.pickerRow}>
        <View style={styles.flex}>
          <WheelPicker
            items={Object.keys(taiwanAreas)}
            value={filters.city}
            placeholder="選擇城市"
            onChange={(city) => onChange({ ...filters, city, district: '' })}
          />
        </View>
        <View style={styles.flex}>
          <WheelPicker
            items={districts}
            value={filters.district}
            placeholder="選擇區域"
            onChange={(district) => onChange({ ...filters, district })}
          />
        </View>
      </View>

      <Text style={styles.label}>類別</Text>
      {categoryGroups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>
            {group.tags.map((tag) => (
              <TagChip key={tag} label={tag} selected={filters.tags.includes(tag)} onPress={() => toggleTag(tag)} />
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.label}>星星數</Text>
      <View style={styles.optionRow}>
        <FilterButton label="全部" selected={!filters.rating} onPress={() => onChange({ ...filters, rating: '' })} />
        {[1, 2, 3, 4, 5].map((rating) => (
          <FilterButton key={rating} label={`${rating}星`} selected={filters.rating === String(rating)} onPress={() => onChange({ ...filters, rating: String(rating) })} />
        ))}
      </View>

      <Text style={styles.label}>狀態</Text>
      <View style={styles.optionRow}>
        <FilterButton label="全部" selected={!filters.status} onPress={() => onChange({ ...filters, status: '' })} />
        {statuses.map((status) => (
          <FilterButton key={status} label={status} selected={filters.status === status} onPress={() => onChange({ ...filters, status })} />
        ))}
      </View>

      {filters.tags.length ? (
        <Text style={styles.selectedText}>已選：{filters.tags.join('、')}</Text>
      ) : null}
    </View>
  );
}

function FilterButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterButton, selected && styles.filterButtonActive]} onPress={onPress}>
      <Text style={[styles.filterButtonText, selected && styles.filterButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  group: {
    marginBottom: spacing.sm,
  },
  groupTitle: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  filterButtonActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer,
  },
  filterButtonText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  filterButtonTextActive: {
    color: colors.onPrimaryContainer,
  },
  selectedText: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
