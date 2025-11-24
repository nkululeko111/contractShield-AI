import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, FileText, TriangleAlert as AlertTriangle, Users, Zap, Globe } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description, color }: any) => (
  <TouchableOpacity style={[styles.featureCard, { borderLeftColor: color }]}>
    <View style={styles.featureIconContainer}>{icon}</View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const StatCard = ({ number, label }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });
  
  const navigation = useNavigation<any>();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Shield size={32} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>ContractShield AI</Text>
          <Text style={styles.heroSubtitle}>Democratizing Legal Power</Text>
          <Text style={styles.heroDescription}>
            Understand, defend, and negotiate any contract without expensive lawyers
          </Text>
          
          {/* Link to Upload Page */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('upload')}
          >
            <Text style={styles.ctaButtonText}>Analyze Your First Contract</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Protecting South Africans</Text>
        <View style={styles.statsGrid}>
          <StatCard number="50K+" label="Contracts Analyzed" />
          <StatCard number="R25M+" label="Money Saved" />
          <StatCard number="98%" label="Accuracy Rate" />
          <StatCard number="4" label="Languages" />
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Revolutionary Features</Text>
        
        <FeatureCard
          icon={<FileText size={24} color="#1E40AF" strokeWidth={2} />}
          title="Explain Like I'm 15"
          description="Complex contracts simplified into plain English. Understand every clause"
          color="#1E40AF"
        />
        
        <FeatureCard
          icon={<AlertTriangle size={24} color="#DC2626" strokeWidth={2} />}
          title="Red Flag Detection"
          description="AI spots illegal clauses, hidden fees, and exploitative terms instantly"
          color="#DC2626"
        />
        
        <FeatureCard
          icon={<Zap size={24} color="#059669" strokeWidth={2} />}
          title="Loophole Finder"
          description="Discovers contradictions and unenforceable terms to protect your interests"
          color="#059669"
        />
        
        <FeatureCard
          icon={<Users size={24} color="#7C3AED" strokeWidth={2} />}
          title="AI Negotiation Coach"
          description="Generates counter-offers and negotiation scripts tailored to your situation"
          color="#7C3AED"
        />
        
        <FeatureCard
          icon={<Globe size={24} color="#EA580C" strokeWidth={2} />}
          title="SA Law Specific"
          description="Cross-checks against BCEA, CPA, NCA, POPIA, and Rental Housing Act"
          color="#EA580C"
        />
      </View>

      {/* How It Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#1E40AF' }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Upload your contract</Text>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#059669' }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>AI analyzes in seconds</Text>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Get actionable insights</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.bottomCta}>
        <Text style={styles.ctaTitle}>Ready to Protect Yourself?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of South Africans taking control of their contracts
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('upload')}
        >
          <Text style={styles.primaryButtonText}>Start  Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
  },
  statsSection: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  howItWorksSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepsContainer: {
    alignItems: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  bottomCta: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  ctaTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});