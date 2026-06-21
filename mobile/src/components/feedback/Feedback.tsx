import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Chargement...',
}) => (
  <View style={styles.overlay}>
    <View style={styles.overlayCard}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.overlayText}>{message}</Text>
    </View>
  </View>
);

interface LoadingSpinnerProps {
  color?: string;
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = Colors.primary,
  size = 'large',
  style,
}) => (
  <View style={[styles.spinnerContainer, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title,
  subtitle,
  action,
  style,
}) => (
  <View style={[styles.emptyState, style]}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action && <View style={styles.emptyAction}>{action}</View>}
  </View>
);

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  style,
}) => (
  <View style={[styles.errorBanner, style]}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorMessage} numberOfLines={3}>{message}</Text>
    {onDismiss && (
      <Text onPress={onDismiss} style={styles.errorDismiss}>✕</Text>
    )}
  </View>
);

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  compact = false,
}) => (
  <View style={[styles.disclaimer, compact && styles.disclaimerCompact]}>
    <Text style={styles.disclaimerIcon}>ℹ️</Text>
    <Text style={[styles.disclaimerText, compact && styles.disclaimerTextCompact]}>
      {compact
        ? 'Cette application ne remplace pas l\'avis d\'un professionnel de santé.'
        : 'Cette application ne remplace pas l\'avis d\'un professionnel de santé. Les observations et recommandations proposées sont à titre éducatif uniquement et ne constituent en aucun cas un diagnostic médical.'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[8],
    alignItems: 'center',
    gap: Spacing[4],
    minWidth: 160,
  },
  overlayText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[10],
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing[4],
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: Spacing[6],
    width: '100%',
  },
  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    marginHorizontal: Spacing[4],
  },
  errorIcon: {
    fontSize: 16,
  },
  errorMessage: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.error,
    lineHeight: 18,
  },
  errorDismiss: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.error,
    padding: Spacing[1],
  },
  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    gap: Spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[2],
  },
  disclaimerCompact: {
    padding: Spacing[2.5],
    marginHorizontal: 0,
    marginVertical: 0,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.info,
    lineHeight: 18,
  },
  disclaimerTextCompact: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
});
