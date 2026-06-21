import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Shadows, BorderRadius, Spacing } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  size = 'md',
  fullWidth = true,
  style,
  icon,
}) => {
  const heights = { sm: 44, md: 52, lg: 60 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      style={[fullWidth && { width: '100%' }, style]}
    >
      <LinearGradient
        colors={disabled ? ['#C4C9D9', '#C4C9D9'] : Colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          { height: heights[size] },
          !disabled && Shadows.primary,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.text, { fontSize: fontSizes[size] }]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  size = 'md',
  fullWidth = true,
  style,
  icon,
}) => {
  const heights = { sm: 44, md: 52, lg: 60 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.md };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.secondaryButton,
        { height: heights[size] },
        fullWidth && { width: '100%' },
        disabled && styles.disabledSecondary,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[
          styles.secondaryText,
          { fontSize: fontSizes[size] },
          disabled && styles.disabledText,
        ]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface TextButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const TextButton: React.FC<TextButtonProps> = ({
  title,
  onPress,
  color = Colors.primary,
  style,
  textStyle,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
    <Text style={[styles.textButtonText, { color }, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: Spacing[2],
  },
  text: {
    color: Colors.textInverse,
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    backgroundColor: Colors.primaryLight,
  },
  secondaryText: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
    letterSpacing: 0.3,
  },
  disabledSecondary: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  textButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
  },
});
