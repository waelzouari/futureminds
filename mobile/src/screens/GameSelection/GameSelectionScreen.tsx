import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useChildrenStore } from '../../store';
import { GameCard } from '../../components/cards/Cards';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { GAME_INFO } from '../../models/GameSession';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'GameSelection'>;
  route: RouteProp<AppStackParamList, 'GameSelection'>;
};

export const GameSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const { children } = useChildrenStore();
  const child = children.find(c => c.id === childId);

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profil enfant non trouvé.</Text>
      </View>
    );
  }

  const handleSelectGame = (gameId: string) => {
    // Generate new unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Check if child has a specific difficulty, default to 1
    const difficultyLevel = 2; // Simulating general adaptive level
    
    navigation.navigate('UnityGame', {
      gameId,
      childId: child.id,
      sessionId,
      difficultyLevel,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EEF3FF', '#F6F8FE']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sélection du Jeu</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Intro text */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Choisis un mini-jeu 🎯</Text>
            <Text style={styles.introText}>
              Chaque jeu aide ton cerveau à s'entraîner tout en s'amusant. Bon jeu !
            </Text>
          </View>

          {/* Games list */}
          <View style={styles.gamesList}>
            {Object.values(GAME_INFO).map(game => {
              // Custom recommendation based on child observed difficulties
              const isRecommended = (child.observedDifficulties || []).some(d => {
                if (d === 'attention' && game.id === 'attention_visual_01') return true;
                if (d === 'memoire_travail' && game.id === 'memory_01') return true;
                if (d === 'impulsivite' && game.id === 'inhibition_01') return true;
                if (d === 'inhibition_reponse' && game.id === 'inhibition_01') return true;
                return false;
              });

              return (
                <GameCard
                  key={game.id}
                  gameId={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  gradientColors={game.gradientColors}
                  difficultyLevel={2} // Default starting difficulty
                  isRecommended={isRecommended}
                  onPress={() => handleSelectGame(game.id)}
                  style={styles.gameCardItem}
                />
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.textPrimary },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
    gap: Spacing[4],
  },
  introCard: {
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  introTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  introText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  gamesList: {
    gap: Spacing[4],
  },
  gameCardItem: {
    width: '100%',
  },
  errorText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
