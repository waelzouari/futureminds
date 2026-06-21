import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChildProfile } from '../../models/ChildProfile';
import { Colors, FontFamily, FontSize, Shadows, BorderRadius, Spacing } from '../../theme';

interface ChildCardProps {
  child: ChildProfile;
  onPress: () => void;
  style?: ViewStyle;
}

export const ChildCard: React.FC<ChildCardProps> = ({ child, onPress, style }) => {
  const hasRecentSession = !!child.lastSessionDate;
  const scoreColor = child.averageScore >= 70 ? Colors.success : child.averageScore >= 50 ? Colors.warning : Colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.container, style]}>
      <View style={styles.card}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { backgroundColor: child.avatarColor + '20' }]}>
          <Text style={styles.avatarEmoji}>{child.avatarEmoji}</Text>
          <View style={[styles.avatarBadge, { backgroundColor: child.avatarColor }]} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{child.firstName}</Text>
          <Text style={styles.age}>{child.age} ans · {child.schoolLevel.toUpperCase()}</Text>
          {hasRecentSession ? (
            <Text style={styles.sessions}>
              {child.totalSessions} session{child.totalSessions > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={styles.noSession}>Aucune session encore</Text>
          )}
        </View>

        {/* Score */}
        {child.totalSessions > 0 && (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: scoreColor }]}>
              {Math.round(child.averageScore)}
            </Text>
            <Text style={styles.scoreLabel}>score moy.</Text>
          </View>
        )}

        {/* Arrow */}
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

interface GameCardProps {
  gameId: string;
  title: string;
  description: string;
  icon: string;
  gradientColors: [string, string];
  difficultyLevel?: number;
  isRecommended?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const GameCard: React.FC<GameCardProps> = ({
  gameId,
  title,
  description,
  icon,
  gradientColors,
  difficultyLevel = 1,
  isRecommended = false,
  onPress,
  style,
}) => {
  const difficultyDots = Array.from({ length: 5 }, (_, i) => i < difficultyLevel);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.gameCardContainer, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gameCard}
      >
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommandé</Text>
          </View>
        )}

        <Text style={styles.gameIcon}>{icon}</Text>
        <Text style={styles.gameTitle}>{title}</Text>
        <Text style={styles.gameDesc} numberOfLines={2}>{description}</Text>

        {/* Difficulty */}
        <View style={styles.difficultyRow}>
          <Text style={styles.difficultyLabel}>Niveau</Text>
          <View style={styles.dots}>
            {difficultyDots.map((active, i) => (
              <View
                key={i}
                style={[styles.dot, active ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ChildCard
  container: {
    marginBottom: Spacing[3],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.base,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  age: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  sessions: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  noSession: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: Spacing[2],
  },
  score: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  scoreLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textTertiary,
    marginLeft: Spacing[1],
  },

  // GameCard
  gameCardContainer: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.md,
  },
  gameCard: {
    padding: Spacing[5],
    minHeight: 160,
    justifyContent: 'space-between',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[0.5],
    borderRadius: BorderRadius.full,
  },
  recommendedText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  gameIcon: {
    fontSize: 36,
    marginBottom: Spacing[2],
  },
  gameTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textInverse,
    marginBottom: Spacing[1],
  },
  gameDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing[3],
    lineHeight: 18,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  difficultyLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
