import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;
};

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const parentScale = useRef(new Animated.Value(1)).current;
  const childScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const animatePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => callback());
  };

  return (
    <LinearGradient
      colors={['#1A1F3A', '#2D1B69', '#1A1F3A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <Text style={styles.brandTitle}>FutureMinds</Text>
            <Text style={styles.brandSubtitle}>Qui es-tu aujourd'hui ?</Text>
          </View>

          {/* Parent Card */}
          <Animated.View style={{ transform: [{ scale: parentScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => animatePress(parentScale, () => navigation.navigate('Login'))}
            >
              <LinearGradient
                colors={['#4A7CF7', '#6B5CE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleCard}
              >
                <View style={styles.roleCardLeft}>
                  <View style={styles.roleIconContainer}>
                    <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
                  </View>
                  <View style={styles.roleCardText}>
                    <Text style={styles.roleTitle}>Parent</Text>
                    <Text style={styles.roleDescription}>
                      Gérez les profils et consultez les progrès
                    </Text>
                  </View>
                </View>
                <Text style={styles.roleArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Child Card */}
          <Animated.View style={{ transform: [{ scale: childScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => animatePress(childScale, () => navigation.navigate('ChildLogin'))}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleCard}
              >
                <View style={styles.roleCardLeft}>
                  <View style={styles.roleIconContainer}>
                    <Text style={styles.roleIcon}>🧒</Text>
                  </View>
                  <View style={styles.roleCardText}>
                    <Text style={styles.roleTitle}>Enfant</Text>
                    <Text style={styles.roleDescription}>
                      Accède à tes jeux avec ton code secret
                    </Text>
                  </View>
                </View>
                <Text style={styles.roleArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footerText}>
            Application éducative pour enfants
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(74, 124, 247, 0.12)',
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 157, 0.10)',
    bottom: 60,
    left: -60,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[10],
    paddingBottom: Spacing[6],
    justifyContent: 'center',
    gap: Spacing[4],
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: { fontSize: 40 },
  brandTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing[1],
  },
  roleCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.lg,
  },
  roleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    flex: 1,
  },
  roleCardText: {
    flex: 1,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: { fontSize: 28 },
  roleTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xl,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  roleDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 18,
  },
  roleArrow: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.bold,
    marginLeft: Spacing[2],
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: Spacing[4],
  },
});
