import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, ParentTabParamList } from '../../navigation/types';
import { useChildrenStore } from '../../store';
import { ChildCard } from '../../components/cards/Cards';
import { EmptyState } from '../../components/feedback/Feedback';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, Shadows } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<ParentTabParamList, 'Children'>,
    NativeStackNavigationProp<AppStackParamList>
  >;
};

export const ChildrenListScreen: React.FC<Props> = ({ navigation }) => {
  const { children } = useChildrenStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profils Enfants</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateChild')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {children.length === 0 ? (
          <EmptyState
            emoji="👶"
            title="Aucun profil enregistré"
            subtitle="Ajoutez un premier enfant pour commencer le suivi de l'attention."
            action={
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateChild')}
              >
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  style={styles.createButtonGradient}
                >
                  <Text style={styles.createButtonText}>Ajouter un enfant</Text>
                </LinearGradient>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.subtitle}>
              Sélectionnez un profil pour voir les rapports de performance détaillés et l'analyse de l'IA.
            </Text>
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onPress={() => navigation.navigate('ChildProfile', { childId: child.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 22,
    fontFamily: FontFamily.bold,
    marginTop: -2,
  },
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing[4],
    lineHeight: 18,
  },
  listContainer: { width: '100%' },
  createButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textInverse,
  },
});
