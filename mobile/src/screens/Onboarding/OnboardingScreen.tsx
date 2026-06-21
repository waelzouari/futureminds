import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { PrimaryButton, SecondaryButton } from '../../components/buttons/Buttons';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

interface Slide {
  id: string;
  emoji: string;
  gradient: [string, string];
  title: string;
  subtitle: string;
  description: string;
  isDisclaimer?: boolean;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🌟',
    gradient: ['#4A7CF7', '#7C6FCD'],
    title: 'Bienvenue sur FutureMinds',
    subtitle: 'Un espace bienveillant pour chaque enfant',
    description:
      'FutureMinds accompagne les enfants à travers des mini-jeux engageants, conçus pour renforcer la concentration, la mémoire et le contrôle de l\'attention — à leur rythme.',
  },
  {
    id: '2',
    emoji: '🎮',
    gradient: ['#7C6FCD', '#4ECDC4'],
    title: 'Des jeux pensés pour eux',
    subtitle: 'Chaque jeu mesure des indicateurs clés',
    description:
      'Nos mini-jeux 2D et 3D collectent des données de session comme la vitesse de réaction, le taux de précision et la durée de concentration. Ces données génèrent des recommandations éducatives personnalisées.',
  },
  {
    id: '3',
    emoji: 'ℹ️',
    gradient: ['#4ECDC4', '#4A7CF7'],
    title: 'Votre confiance, notre priorité',
    subtitle: 'Confidentialité & éthique',
    description:
      'Les données de votre enfant sont sécurisées et confidentielles. FutureMinds propose uniquement des recommandations éducatives générales. Aucun diagnostic médical n\'est posé par cette application.',
    isDisclaimer: true,
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const skip = () => navigation.replace('Login');

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.illustrationContainer}
      >
        <Text style={styles.slideEmoji}>{item.emoji}</Text>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {item.isDisclaimer && (
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerIcon}>⚕️</Text>
            <Text style={styles.disclaimerText}>
              Cette application ne remplace pas l'avis d'un professionnel de santé.
              Consultez toujours un médecin ou un spécialiste pour toute évaluation clinique.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <PrimaryButton title="Suivant" onPress={goToNext} fullWidth={false} style={styles.nextButton} />
              <TouchableOpacity onPress={skip} style={styles.skipButton}>
                <Text style={styles.skipText}>Passer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.finalButtons}>
              <PrimaryButton title="Créer un compte" onPress={() => navigation.replace('Register')} />
              <View style={styles.spacer} />
              <SecondaryButton title="Se connecter" onPress={() => navigation.replace('Login')} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  illustrationContainer: {
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  slideEmoji: {
    fontSize: 90,
    zIndex: 2,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -30,
    left: -30,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    color: Colors.secondary,
    marginBottom: Spacing[3],
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginTop: Spacing[5],
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
    gap: Spacing[3],
  },
  disclaimerIcon: { fontSize: 22 },
  disclaimerText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.info,
    lineHeight: 20,
  },
  controls: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[5],
    backgroundColor: Colors.background,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing[6],
    gap: Spacing[1.5],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextButton: {
    paddingHorizontal: Spacing[8],
    flex: 0,
    width: 'auto',
  },
  skipButton: {
    padding: Spacing[3],
  },
  skipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textTertiary,
  },
  finalButtons: {
    flex: 1,
  },
  spacer: { height: Spacing[3] },
});
