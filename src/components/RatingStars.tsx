import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

type RatingStarsProps = {
  rating?: number;
  onChange?: (rating: number) => void;
  size?: number;
};

export function RatingStars({ rating, onChange, size = 20 }: RatingStarsProps) {
  if (!rating && !onChange) return null;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = Boolean(rating && star <= rating);
        const icon = (
          <Ionicons
            key={star}
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? colors.primaryContainer : colors.outline}
          />
        );

        if (!onChange) return icon;
        return (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={8}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
