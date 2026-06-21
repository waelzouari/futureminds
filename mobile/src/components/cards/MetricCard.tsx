import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, Shadows, BorderRadius, Spacing } from '../../theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  color = Colors.primary,
  trend,
  style,
}) => {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.textTertiary;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: color + '18' }]}>
            <Text style={[styles.icon]}>{icon}</Text>
          </View>
        )}
        {trend && (
          <Text style={[styles.trend, { color: trendColor }]}>{trendIcon}</Text>
        )}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

interface ScoreRingProps {
  score: number;
  size?: number;
  color?: string;
  label?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 80,
  color = Colors.primary,
  label,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const scoreLabel = clampedScore >= 80 ? 'Excellent' : clampedScore >= 60 ? 'Bien' : 'En progrès';

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <View style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: color + '30' }
      ]}>
        <View style={[
          styles.ringFill,
          {
            width: size - 12,
            height: size - 12,
            borderRadius: (size - 12) / 2,
            borderColor: color,
            borderTopColor: 'transparent',
          }
        ]} />
        <View style={styles.ringContent}>
          <Text style={[styles.ringScore, { color, fontSize: size * 0.24 }]}>
            {clampedScore}
          </Text>
          <Text style={[styles.ringUnit, { fontSize: size * 0.12 }]}>%</Text>
        </View>
      </View>
      {label && <Text style={[styles.ringLabel, { color }]}>{label}</Text>}
    </View>
  );
};

interface ProgressBarProps {
  value: number;   // 0-100
  color?: string;
  height?: number;
  label?: string;
  showValue?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = Colors.primary,
  height = 8,
  label,
  showValue = false,
  style,
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <View style={[styles.progressContainer, style]}>
      {(label || showValue) && (
        <View style={styles.progressHeader}>
          {label && <Text style={styles.progressLabel}>{label}</Text>}
          {showValue && (
            <Text style={[styles.progressValue, { color }]}>{Math.round(clampedValue)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.progressTrack, { height }]}>
        <View style={[
          styles.progressFill,
          { width: `${clampedValue}%`, backgroundColor: color, height },
        ]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    ...Shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  trend: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.bold,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    marginBottom: Spacing[0.5],
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing[0.5],
  },
  // Ring
  ringContainer: {
    alignItems: 'center',
  },
  ring: {
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringFill: {
    position: 'absolute',
    borderWidth: 6,
    top: -6,
    left: -6,
  },
  ringContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ringScore: {
    fontFamily: FontFamily.bold,
  },
  ringUnit: {
    fontFamily: FontFamily.semiBold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ringLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    marginTop: Spacing[1],
    textAlign: 'center',
  },
  // Progress Bar
  progressContainer: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  progressLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
  },
  progressTrack: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: BorderRadius.full,
  },
});
