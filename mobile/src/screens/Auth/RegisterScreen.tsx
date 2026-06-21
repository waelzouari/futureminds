import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store';
import { PrimaryButton, TextButton } from '../../components/buttons/Buttons';
import { ErrorBanner } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    if (!displayName.trim()) return 'Veuillez entrer votre nom.';
    if (!email.trim()) return 'Veuillez entrer votre email.';
    if (!email.includes('@')) return 'Email invalide.';
    if (password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères.';
    if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    clearError();
    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim(), 'parent');
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <LinearGradient
      colors={['#F6F8FE', '#EEF3FF', '#F0EEFB']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.logoSmall}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
          </View>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez FutureMinds pour accompagner vos enfants.</Text>


          <View style={styles.formCard}>
            {displayError && (
              <ErrorBanner
                message={displayError}
                onDismiss={() => { setLocalError(null); clearError(); }}
                style={styles.errorBanner}
              />
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nom complet</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom et prénom"
                  placeholderTextColor={Colors.textTertiary}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Adresse e-mail</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Au moins 6 caractères"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
              <View style={[
                styles.inputContainer,
                confirmPassword && password !== confirmPassword && styles.inputError,
              ]}>
                <Text style={styles.inputIcon}>🔑</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Répétez le mot de passe"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>
            </View>

            <PrimaryButton
              title={isLoading ? 'Création du compte...' : 'Créer mon compte'}
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={!displayName.trim() || !email.trim() || !password.trim()}
              style={styles.registerButton}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Déjà un compte ?</Text>
              <TextButton
                title=" Se connecter"
                onPress={() => navigation.navigate('Login')}
              />
            </View>
          </View>

          <Text style={styles.disclaimer}>
            Cette application ne remplace pas l'avis d'un professionnel de santé.{' '}
            Les données des enfants sont traitées avec confidentialité.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[12],
    paddingBottom: Spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[6],
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: FontFamily.semiBold,
  },
  logoSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing[5],
    lineHeight: 22,
  },
  roleContainer: { marginBottom: Spacing[5] },
  roleLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing[2],
  },
  roleButtons: { flexDirection: 'row', gap: Spacing[3] },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing[1.5],
  },
  roleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleIcon: { fontSize: 24 },
  roleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roleTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    ...Shadows.lg,
  },
  errorBanner: { marginHorizontal: 0, marginBottom: Spacing[4] },
  fieldGroup: { marginBottom: Spacing[4] },
  fieldLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing[1.5],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    height: 52,
  },
  inputError: { borderColor: Colors.error },
  inputIcon: { fontSize: 16, marginRight: Spacing[2] },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeButton: { padding: Spacing[1] },
  eyeIcon: { fontSize: 16 },
  registerButton: { marginTop: Spacing[2] },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
  },
  loginText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  disclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing[6],
    lineHeight: 16,
    paddingHorizontal: Spacing[4],
  },
});
