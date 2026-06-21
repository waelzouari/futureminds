import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { firestoreService } from '../../services/firestoreService';
import { useAuthStore, useChildrenStore } from '../../store';
import { PrimaryButton } from '../../components/buttons/Buttons';
import { ErrorBanner, MedicalDisclaimer } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { SchoolLevel, ObservedDifficulty, SCHOOL_LEVEL_LABELS, DIFFICULTY_LABELS, AVATAR_COLORS, AVATAR_EMOJIS } from '../../models/ChildProfile';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'CreateChild'>;
};

export const CreateChildScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { addChild, selectChild } = useChildrenStore();
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('cp');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ObservedDifficulty[]>([]);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_EMOJIS[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string>('');

  const toggleDifficulty = (difficulty: ObservedDifficulty) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulties([...selectedDifficulties, difficulty]);
    }
  };

  const handleCreate = async () => {
    if (!firstName.trim()) {
      setError('Veuillez entrer un prénom.');
      return;
    }
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      setError('Veuillez entrer un âge valide.');
      return;
    }
    if (!user?.id) {
      setError('Utilisateur non connecté.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const childData = {
        firstName: firstName.trim(),
        age: parsedAge,
        schoolLevel,
        gamePreferences: [], // Filled based on games played
        observedDifficulties: selectedDifficulties,
        avatarColor,
        avatarEmoji,
      };

      const newChild = await firestoreService.createChild(childData, user.id);
      
      // Update store
      addChild(newChild);
      
      // Show code to parent before navigating back
      setCreatedName(newChild.firstName);
      setCreatedCode(newChild.childCode);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeDismiss = () => {
    setCreatedCode(null);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Child Code Reveal Modal */}
      <Modal
        visible={createdCode !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>Profil créé avec succès !</Text>
            <Text style={styles.modalSubtitle}>
              Voici le code de connexion de {createdName}.
              Communiquez-le-lui pour qu'il puisse se connecter.
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Identifiant de connexion</Text>
              <View style={styles.codeBox}>
                {(createdCode || '').split('').map((digit, i) => (
                  <View key={i} style={styles.codeDigitBox}>
                    <Text style={styles.codeDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.codeHint}>
                L'enfant entre ce code sur l'écran "Connexion Enfant"
              </Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleCodeDismiss}>
              <Text style={styles.modalButtonText}>✓  J'ai noté le code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LinearGradient
        colors={['#F6F8FE', '#EEF3FF']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouveau profil</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {error && (
              <ErrorBanner
                message={error}
                onDismiss={() => setError(null)}
                style={styles.errorBanner}
              />
            )}

            {/* Avatar Selector */}
            <View style={styles.avatarCard}>
              <View style={[styles.avatarPreview, { backgroundColor: avatarColor + '20' }]}>
                <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
                <View style={[styles.avatarBadge, { backgroundColor: avatarColor }]} />
              </View>
              
              <Text style={styles.avatarLabel}>Personnaliser l'avatar</Text>
              
              {/* Emoji selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow}>
                {AVATAR_EMOJIS.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiButton, avatarEmoji === emoji && styles.emojiButtonActive]}
                    onPress={() => setAvatarEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow}>
                {AVATAR_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorButton, { backgroundColor: color }, avatarColor === color && styles.colorButtonActive]}
                    onPress={() => setAvatarColor(color)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* General Info Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Informations générales</Text>

              {/* Prénom */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Prénom</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Prénom de l'enfant"
                    placeholderTextColor={Colors.textTertiary}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Âge */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Âge</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 8"
                    placeholderTextColor={Colors.textTertiary}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Niveau scolaire */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Niveau scolaire</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectRow}>
                  {Object.entries(SCHOOL_LEVEL_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.selectItem,
                        schoolLevel === key && styles.selectItemActive,
                      ]}
                      onPress={() => setSchoolLevel(key as SchoolLevel)}
                    >
                      <Text style={[styles.selectText, schoolLevel === key && styles.selectTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Difficultés observées (pour adapter les futures recommandations LLM) */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Difficultés observées (Facultatif)</Text>
              <Text style={styles.formSubtitle}>
                Sélectionnez les domaines où l'enfant rencontre des difficultés. Ces données aident le service d'IA à affiner ses recommandations éducatives globales.
              </Text>

              <View style={styles.chipGrid}>
                {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => {
                  const isSelected = selectedDifficulties.includes(key as ObservedDifficulty);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleDifficulty(key as ObservedDifficulty)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action */}
            <PrimaryButton
              title={isLoading ? 'Création en cours...' : 'Créer le profil'}
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={!firstName.trim() || !age.trim()}
              style={styles.submitButton}
            />

            <MedicalDisclaimer compact style={styles.disclaimer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  keyboardAvoid: { flex: 1 },
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
  errorBanner: { marginHorizontal: 0 },
  avatarCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing[3],
  },
  avatarEmoji: { fontSize: 44 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing[4],
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: Spacing[3],
    width: '100%',
  },
  emojiButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing[2],
    backgroundColor: Colors.background,
  },
  emojiButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emojiText: { fontSize: 22 },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing[2],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: Colors.textPrimary,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
    gap: Spacing[4],
  },
  formTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing[1],
  },
  formSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing[2],
  },
  fieldGroup: { gap: Spacing[2] },
  fieldLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  selectRow: { flexDirection: 'row', width: '100%' },
  selectItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing[2],
    backgroundColor: Colors.background,
  },
  selectItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  selectText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  selectTextActive: {
    color: Colors.textInverse,
    fontFamily: FontFamily.semiBold,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
  submitButton: { marginTop: Spacing[2] },
  disclaimer: { marginHorizontal: 0, marginTop: Spacing[2] },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[5],
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[7],
    alignItems: 'center',
    width: '100%',
    gap: Spacing[3],
    ...Shadows.lg,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  modalIcon: { fontSize: 40 },
  modalTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginVertical: Spacing[2],
  },
  codeLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeBox: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  codeDigitBox: {
    width: 54,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  codeDigit: {
    fontFamily: FontFamily.extraBold,
    fontSize: 30,
    color: '#FFFFFF',
  },
  codeHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[8],
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing[2],
    ...Shadows.primary,
  },
  modalButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
});
