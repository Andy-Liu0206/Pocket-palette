import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { categoryGroups } from '../data/categories';
import { taiwanAreas } from '../data/taiwanAreas';
import { colors, radius, shadow, spacing } from '../theme';
import { TagChip } from './TagChip';
import { WheelPicker } from './WheelPicker';

export type ListFilters = {
  city: string;
  districts: string[];
  tags: string[];
};

type FilterSectionProps = {
  filters: ListFilters;
  onChange: (filters: ListFilters) => void;
};

const listCategoryGroups = categoryGroups.filter((group) => group.title === '日常餐食' || group.title === '料理種類');

export function FilterSection({ filters, onChange }: FilterSectionProps) {
  const [customTags, setCustomTags] = useState<Record<string, string[]>>({});
  const [customTagDraft, setCustomTagDraft] = useState<{ groupTitle: string; value: string } | null>(null);
  const districts = filters.city ? taiwanAreas[filters.city] ?? [] : [];

  const toggleDistrict = (district: string) => {
    const nextDistricts = filters.districts.includes(district)
      ? filters.districts.filter((current) => current !== district)
      : [...filters.districts, district];
    onChange({ ...filters, districts: nextDistricts });
  };

  const toggleTag = (tag: string) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((current) => current !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: nextTags });
  };

  const addCustomTag = () => {
    if (!customTagDraft) return;
    const value = customTagDraft.value.trim();
    if (!value) {
      setCustomTagDraft(null);
      return;
    }

    setCustomTags((current) => {
      const groupTags = current[customTagDraft.groupTitle] ?? [];
      if (groupTags.includes(value)) return current;
      return { ...current, [customTagDraft.groupTitle]: [...groupTags, value] };
    });
    if (!filters.tags.includes(value)) {
      onChange({ ...filters, tags: [...filters.tags, value] });
    }
    setCustomTagDraft(null);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>篩選條件</Text>

      <Text style={styles.label}>地區</Text>
      <View style={styles.cityPicker}>
        <WheelPicker
          items={Object.keys(taiwanAreas)}
          value={filters.city}
          placeholder="選擇城市"
          onChange={(city) => onChange({ ...filters, city, districts: [] })}
        />
      </View>
      <View style={styles.optionRow}>
        <FilterButton label="全部區域" selected={!filters.districts.length} onPress={() => onChange({ ...filters, districts: [] })} />
        {districts.map((district) => (
          <FilterButton key={district} label={district} selected={filters.districts.includes(district)} onPress={() => toggleDistrict(district)} />
        ))}
      </View>

      <Text style={styles.label}>類別</Text>
      {listCategoryGroups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>
            {[...group.tags, ...(customTags[group.title] ?? [])].map((tag) => (
              <TagChip key={tag} label={tag} selected={filters.tags.includes(tag)} onPress={() => toggleTag(tag)} />
            ))}
            <Pressable style={styles.addTagButton} onPress={() => setCustomTagDraft({ groupTitle: group.title, value: '' })}>
              <Ionicons name="add" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      ))}

      {filters.districts.length || filters.tags.length ? (
        <Text style={styles.selectedText}>
          已選：{[...filters.districts, ...filters.tags].join('、')}
        </Text>
      ) : null}

      <Modal visible={Boolean(customTagDraft)} transparent animationType="fade" onRequestClose={() => setCustomTagDraft(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>新增{customTagDraft?.groupTitle}</Text>
            <TextInput
              value={customTagDraft?.value ?? ''}
              onChangeText={(value) => setCustomTagDraft((current) => (current ? { ...current, value } : current))}
              placeholder="輸入自定義分類"
              placeholderTextColor={colors.outline}
              autoFocus
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondaryButton} onPress={() => setCustomTagDraft(null)}>
                <Text style={styles.modalSecondaryText}>取消</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={addCustomTag}>
                <Text style={styles.modalPrimaryText}>新增</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  cityPicker: {
    marginBottom: spacing.sm,
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
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(34, 26, 18, 0.36)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  modalTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.onSurface,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalSecondaryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  modalPrimaryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
  },
  modalSecondaryText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  modalPrimaryText: {
    color: colors.onPrimaryContainer,
    fontWeight: '900',
  },
});
