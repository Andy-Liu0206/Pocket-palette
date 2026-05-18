import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RatingStars } from '../components/RatingStars';
import { Screen } from '../components/Screen';
import { TagChip } from '../components/TagChip';
import { WheelPicker } from '../components/WheelPicker';
import { categoryGroups } from '../data/categories';
import { taiwanAreas } from '../data/taiwanAreas';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, radius, shadow, spacing } from '../theme';
import type { RestaurantDraft, RestaurantStatus, SourcePlatform } from '../types/restaurant';
import { extractCoordinateFromUrl } from '../utils/locationResolver';
import { analyzeSocialFoodUrl, detectSourcePlatform, normalizeSocialUrl } from '../utils/socialImport';

type AddMode = 'manual' | 'import';

type FormState = {
  name: string;
  city: string;
  district: string;
  address: string;
  signatureFood: string;
  tags: string[];
  status: RestaurantStatus;
  rating?: number;
  comment: string;
  sourceUrl: string;
  sourcePlatform: SourcePlatform | '';
  sourceCaption: string;
  aiSummary: string;
  aiExtractedTags: string[];
  aiDailyMealTags: string[];
  aiCuisineTags: string[];
  aiWarnings: string[];
  aiConfidence: string;
  isImportedFromSocial: boolean;
};

const emptyForm: FormState = {
  name: '',
  city: '台北市',
  district: '中山區',
  address: '',
  signatureFood: '',
  tags: [],
  status: '尚未去過',
  rating: undefined,
  comment: '',
  sourceUrl: '',
  sourcePlatform: '',
  sourceCaption: '',
  aiSummary: '',
  aiExtractedTags: [],
  aiDailyMealTags: [],
  aiCuisineTags: [],
  aiWarnings: [],
  aiConfidence: '',
  isImportedFromSocial: false,
};

const statuses: RestaurantStatus[] = ['尚未去過', '已去過', '我的最愛'];
const platforms: SourcePlatform[] = ['Instagram', 'Threads', 'Reels', 'Google Maps', 'Website', 'Other'];

export function AddScreen() {
  const { addRestaurant } = useRestaurants();
  const [mode, setMode] = useState<AddMode>('manual');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [url, setUrl] = useState('');
  const [pastedCaption, setPastedCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importError, setImportError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [hasImportResult, setHasImportResult] = useState(false);

  const districts = useMemo(() => taiwanAreas[form.city] ?? [], [form.city]);
  const detectedImportUrl = useMemo(() => normalizeSocialUrl(url), [url]);
  const hasImportInput = Boolean(url.trim() || pastedCaption.trim() || hasImportResult);
  const canSave = Boolean(form.name.trim() && form.city && form.district && form.tags.length > 0);

  const updateForm = (updates: Partial<FormState>) => setForm((current) => ({ ...current, ...updates }));

  const toggleTag = (tag: string) => {
    updateForm({
      tags: form.tags.includes(tag) ? form.tags.filter((current) => current !== tag) : [...form.tags, tag],
    });
  };

  const updateSourceUrl = (sourceUrl: string) => {
    updateForm({
      sourceUrl,
      sourcePlatform: sourceUrl.trim() ? detectSourcePlatform(normalizeSocialUrl(sourceUrl)) : '',
    });
  };

  const toggleSourcePlatform = (platform: SourcePlatform) => {
    updateForm({
      sourcePlatform: form.sourcePlatform === platform ? '' : platform,
    });
  };

  const getImportFeedback = (sourceCaption: string | undefined, missing: string[]) => {
    if (!sourceCaption?.trim()) {
      return '無法讀取連結中的貼文文案，請貼上文案後再分析一次。';
    }
    if (missing.length) {
      return `已讀取文案，但仍需補上：${missing.join('、')}。`;
    }
    return '';
  };

  const analyzeUrl = async () => {
    setIsAnalyzing(true);
    setImportError('');
    setMissingFields([]);
    try {
      const result = await analyzeSocialFoodUrl(url, pastedCaption);
      setForm({
        ...emptyForm,
        name: result.name ?? '',
        city: result.city ?? emptyForm.city,
        district: result.district ?? (result.city ? taiwanAreas[result.city]?.[0] ?? '' : emptyForm.district),
        address: result.address ?? '',
        signatureFood: result.signatureFood ?? '',
        tags: result.tags ?? [],
        status: result.status ?? '尚未去過',
        rating: result.rating,
        comment: result.comment ?? '',
        sourceUrl: result.sourceUrl ?? normalizeSocialUrl(url),
        sourcePlatform: result.sourcePlatform ?? 'Other',
        sourceCaption: result.sourceCaption ?? pastedCaption,
        aiSummary: result.aiSummary ?? '',
        aiExtractedTags: result.aiExtractedTags ?? result.tags ?? [],
        aiDailyMealTags: result.aiDailyMealTags ?? [],
        aiCuisineTags: result.aiCuisineTags ?? [],
        aiWarnings: result.warnings ?? [],
        aiConfidence: result.aiConfidence ? String(result.aiConfidence) : '',
        isImportedFromSocial: true,
      });
      setUrl(result.normalizedUrl);
      setMissingFields(result.missingFields);
      setImportError(getImportFeedback(result.sourceCaption, result.missingFields));
      setHasImportResult(true);
    } catch {
      setImportError('目前無法完整讀取此連結內容，請手動補上店家資訊，或貼上貼文文案後再試一次。');
      setForm({
        ...emptyForm,
        sourceUrl: detectedImportUrl,
        sourceCaption: pastedCaption,
        sourcePlatform: detectedImportUrl ? detectSourcePlatform(detectedImportUrl) : 'Other',
        aiDailyMealTags: [],
        aiCuisineTags: [],
        aiWarnings: ['AI 服務暫時無法完成解析，已保留來源資訊供手動補齊。'],
        aiConfidence: '0.18',
        isImportedFromSocial: true,
      });
      setMissingFields(['店家名稱', '城市', '區域', '至少一個標籤分類']);
      setHasImportResult(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setForm(emptyForm);
    setUrl('');
    setPastedCaption('');
    setImportError('');
    setMissingFields([]);
    setHasImportResult(false);
  };

  const submit = async () => {
    if (!canSave) {
      Alert.alert('資料尚未完整', '請至少填寫店家名稱、城市、區域，並選擇一個標籤分類。');
      return;
    }

    const normalizedSourceUrl = normalizeSocialUrl(form.sourceUrl);
    const hasSource = Boolean(normalizedSourceUrl);
    const sourceCoordinate = extractCoordinateFromUrl(normalizedSourceUrl);
    const draft: RestaurantDraft = {
      name: form.name.trim(),
      city: form.city,
      district: form.district,
      address: form.address.trim() || undefined,
      signatureFood: form.signatureFood.trim(),
      tags: form.tags,
      status: form.status,
      rating: form.rating,
      comment: form.comment.trim() || undefined,
      latitude: sourceCoordinate?.latitude,
      longitude: sourceCoordinate?.longitude,
      sourceUrl: normalizedSourceUrl || undefined,
      sourcePlatform: form.sourcePlatform || (hasSource ? detectSourcePlatform(normalizedSourceUrl) : undefined),
      sourceCaption: form.sourceCaption.trim() || undefined,
      aiSummary: form.aiSummary.trim() || undefined,
      aiExtractedTags: form.aiExtractedTags.length ? form.aiExtractedTags : undefined,
      aiDailyMealTags: form.aiDailyMealTags.length ? form.aiDailyMealTags : undefined,
      aiCuisineTags: form.aiCuisineTags.length ? form.aiCuisineTags : undefined,
      aiConfidence: form.aiConfidence ? Number(form.aiConfidence) : undefined,
      isImportedFromSocial: form.isImportedFromSocial || hasSource,
    };

    await addRestaurant(draft);
    Alert.alert('新增成功', `${draft.name} 已加入 Pocket Palette。`);
    resetAll();
    setMode('manual');
  };

  return (
    <View style={styles.screenRoot}>
      <Screen title="Add" subtitle="新增口袋名單，或貼上社群連結輔助匯入。">
      <View style={styles.segment}>
        <Pressable style={[styles.segmentButton, mode === 'manual' && styles.segmentActive]} onPress={() => setMode('manual')}>
          <Text style={[styles.segmentText, mode === 'manual' && styles.segmentTextActive]}>手動新增</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, mode === 'import' && styles.segmentActive]} onPress={() => setMode('import')}>
          <Text style={[styles.segmentText, mode === 'import' && styles.segmentTextActive]}>連結匯入</Text>
        </Pressable>
      </View>

      {mode === 'import' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>貼上連結自動匯入</Text>
          <LabeledInput
            label="分享連結或分享文字"
            value={url}
            onChangeText={setUrl}
            placeholder="貼上 IG / Threads / Reels / Google Maps 分享內容"
            multiline
          />
          {url ? <Text style={styles.normalizedUrl}>偵測到連結：{detectedImportUrl || '尚未偵測到有效 URL'}</Text> : null}
          <LabeledInput
            label="貼上 IG / Threads 文案（可選）"
            value={pastedCaption}
            onChangeText={setPastedCaption}
            placeholder="可只貼連結；若平台阻擋公開讀取，再貼上文案可提高解析成功率。"
            multiline
          />
          {importError ? <Text style={styles.errorText}>{importError}</Text> : null}
          <View style={styles.importActionRow}>
            <Pressable style={[styles.secondaryButton, !hasImportInput && styles.disabledButton]} onPress={resetAll} disabled={!hasImportInput || isAnalyzing}>
              <Text style={styles.secondaryButtonText}>重新填入</Text>
            </Pressable>
            <Pressable style={[styles.primaryButton, styles.importPrimaryButton]} onPress={analyzeUrl} disabled={isAnalyzing}>
              {isAnalyzing ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryButtonText}>分析連結</Text>}
            </Pressable>
          </View>
        </View>
      ) : null}

      {mode === 'manual' || hasImportResult ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{mode === 'import' ? '匯入確認' : '手動新增表單'}</Text>
          {mode === 'import' ? <Text style={styles.helpText}>AI 解析結果只是草稿，請確認資料後再儲存。</Text> : null}
          {mode === 'import' && form.aiConfidence ? (
            <View style={styles.analysisBox}>
              <Text style={styles.analysisTitle}>AI 信心分數：{Math.round(Number(form.aiConfidence) * 100)}%</Text>
              <Text style={styles.analysisText}>{missingFields.length ? `缺漏欄位：${missingFields.join('、')}` : '必要欄位已具備，請再檢查內容是否正確。'}</Text>
            </View>
          ) : null}
          {mode === 'import' && form.aiWarnings.length ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>AI 解析提醒</Text>
              <Text style={styles.analysisText}>{form.aiWarnings.join('、')}</Text>
            </View>
          ) : null}
          {mode === 'import' && (form.aiDailyMealTags.length || form.aiCuisineTags.length) ? (
            <View style={styles.analysisBox}>
              <Text style={styles.analysisTitle}>AI 餐食判斷</Text>
              {form.aiDailyMealTags.length ? <Text style={styles.analysisText}>日常餐食：{form.aiDailyMealTags.join('、')}</Text> : null}
              {form.aiCuisineTags.length ? <Text style={styles.analysisText}>料理種類：{form.aiCuisineTags.join('、')}</Text> : null}
            </View>
          ) : null}

          <LabeledInput label="店家名稱 *" value={form.name} onChangeText={(name) => updateForm({ name })} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.label}>所在城市 *</Text>
              <WheelPicker
                items={Object.keys(taiwanAreas)}
                value={form.city}
                onChange={(city) => updateForm({ city, district: taiwanAreas[city]?.[0] ?? '' })}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>區域 *</Text>
              <WheelPicker items={districts} value={form.district} onChange={(district) => updateForm({ district })} />
            </View>
          </View>

          <LabeledInput label="地址 / 位置資訊" value={form.address} onChangeText={(address) => updateForm({ address })} />
          <LabeledInput label="招牌食物" value={form.signatureFood} onChangeText={(signatureFood) => updateForm({ signatureFood })} />

          <Text style={styles.label}>狀態</Text>
          <View style={styles.statusRow}>
            {statuses.map((status) => (
              <Pressable
                key={status}
                style={[styles.statusButton, form.status === status && styles.statusButtonActive]}
                onPress={() => updateForm({ status })}
              >
                <Text style={[styles.statusButtonText, form.status === status && styles.statusButtonTextActive]}>{status}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>標籤分類 * 可複選</Text>
          {categoryGroups.map((group) => (
            <View key={group.title} style={styles.tagGroup}>
              <Text style={styles.tagGroupTitle}>{group.title}</Text>
              <View style={styles.chips}>
                {group.tags.map((tag) => (
                  <TagChip key={tag} label={tag} selected={form.tags.includes(tag)} onPress={() => toggleTag(tag)} />
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.label}>評分，可選填</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={form.rating} onChange={(rating) => updateForm({ rating })} size={30} />
            {form.rating ? (
              <Pressable onPress={() => updateForm({ rating: undefined })}>
                <Text style={styles.clearRating}>清除</Text>
              </Pressable>
            ) : null}
          </View>

          <LabeledInput label="評論" value={form.comment} onChangeText={(comment) => updateForm({ comment })} multiline />

          <View style={styles.importFields}>
            <Text style={styles.sectionTitle}>來源資訊</Text>
            <Text style={styles.helpText}>可貼上 IG Reels、Threads 或 Google Maps 連結；再次點擊已選平台可取消。</Text>
            <LabeledInput label="來源連結" value={form.sourceUrl} onChangeText={updateSourceUrl} placeholder="https://www.instagram.com/reel/..." />
            <Text style={styles.label}>來源平台</Text>
            <View style={styles.platformRow}>
              {platforms.map((platform) => (
                <Pressable
                  key={platform}
                  style={[styles.platformButton, form.sourcePlatform === platform && styles.statusButtonActive]}
                  onPress={() => toggleSourcePlatform(platform)}
                >
                  <Text style={[styles.statusButtonText, form.sourcePlatform === platform && styles.statusButtonTextActive]}>{platform}</Text>
                </Pressable>
              ))}
            </View>
            {mode === 'import' ? (
              <>
                <LabeledInput label="貼文文案" value={form.sourceCaption} onChangeText={(sourceCaption) => updateForm({ sourceCaption })} multiline />
                <LabeledInput label="AI 推薦摘要" value={form.aiSummary} onChangeText={(aiSummary) => updateForm({ aiSummary })} multiline />
              </>
            ) : null}
          </View>

          {!canSave ? <Text style={styles.errorText}>必要欄位：店家名稱、城市、區域、至少一個標籤分類。</Text> : null}
          <Pressable style={[styles.primaryButton, !canSave && styles.disabledButton]} onPress={submit}>
            <Text style={styles.primaryButtonText}>{mode === 'import' ? '確認儲存到口袋名單' : '新增店家'}</Text>
          </Pressable>
        </View>
      ) : null}
      </Screen>
      <Modal visible={isAnalyzing} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTitle}>請稍後</Text>
            <Text style={styles.loadingText}>AI 正在解讀 Reels 文案並提取店家資訊...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  segmentActive: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadow.card,
  },
  segmentText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  helpText: {
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    color: colors.onSurface,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  statusButtonActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  statusButtonText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  statusButtonTextActive: {
    color: colors.onPrimaryContainer,
  },
  platformRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  platformButton: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  tagGroup: {
    marginBottom: spacing.sm,
  },
  tagGroupTitle: {
    color: colors.primary,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  clearRating: {
    color: colors.primary,
    fontWeight: '900',
  },
  importFields: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    paddingTop: spacing.lg,
    marginTop: spacing.md,
  },
  importActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  importPrimaryButton: {
    flex: 1,
    marginTop: 0,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 16,
  },
  errorText: {
    color: '#ba1a1a',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  normalizedUrl: {
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  analysisBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  warningBox: {
    backgroundColor: '#fff4e5',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  analysisTitle: {
    color: colors.primary,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  warningTitle: {
    color: '#8a4b00',
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  analysisText: {
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(21, 18, 16, 0.42)',
    padding: spacing.lg,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.xl,
    ...shadow.card,
  },
  loadingTitle: {
    marginTop: spacing.md,
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '900',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});
