import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Zap, MessageSquare, Globe, Clock } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

const AnalysisCard = ({ icon, title, description, severity, details }: any) => {
  const [expanded, setExpanded] = useState(false);
  
  const severityColors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#059669',
    info: '#1E40AF',
  };

  return (
    <TouchableOpacity 
      style={[styles.analysisCard, { borderLeftColor: severityColors[severity] }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconContainer, { backgroundColor: severityColors[severity] + '20' }]}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
      
      {expanded && (
        <View style={styles.cardDetails}>
          <Text style={styles.detailsText}>{details}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const LanguageSelector = ({ selected, onSelect }: any) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇿🇦' },
    { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'xh', name: 'isiXhosa', flag: '🇿🇦' },
  ];

  return (
    <View style={styles.languageSelector}>
      <Text style={styles.languageSelectorTitle}>Analysis Language</Text>
      <View style={styles.languageOptions}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageOption,
              selected === lang.code && styles.languageOptionSelected
            ]}
            onPress={() => onSelect(lang.code)}
          >
            <Text style={styles.languageFlag}>{lang.flag}</Text>
            <Text style={[
              styles.languageText,
              selected === lang.code && styles.languageTextSelected
            ]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function AnalysisScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const analysisData = [
    {
      icon: <AlertTriangle size={20} color="#DC2626" strokeWidth={2} />,
      title: "Illegal Termination Clause",
      description: "Clause 4.2 violates BCEA Section 188",
      severity: "high",
      details: "The contract allows termination without proper notice period required by the Basic Conditions of Employment Act. This clause is unenforceable and you can challenge it legally."
    },
    {
      icon: <Zap size={20} color="#F59E0B" strokeWidth={2} />,
      title: "Unfair Non-Compete",
      description: "6-month restriction may be excessive",
      severity: "medium",
      details: "The non-compete clause extends for 6 months which may be deemed unreasonable by SA courts. Consider negotiating down to 3 months or adding geographic limitations."
    },
    {
      icon: <CheckCircle size={20} color="#059669" strokeWidth={2} />,
      title: "Fair Salary Payment",
      description: "Payment terms comply with labour law",
      severity: "low",
      details: "Monthly salary payments within 7 days of month-end comply with standard employment practices and BCEA requirements."
    },
    {
      icon: <MessageSquare size={20} color="#1E40AF" strokeWidth={2} />,
      title: "Missing Dispute Resolution",
      description: "No clear process for handling disputes",
      severity: "info",
      details: "The contract lacks a dispute resolution mechanism. Consider adding a clause requiring mediation before litigation to save costs."
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'redflags', label: 'Red Flags' },
    { id: 'loopholes', label: 'Loopholes' },
    { id: 'negotiate', label: 'Negotiate' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Analysis</Text>
        <Text style={styles.headerSubtitle}>
          Employment Contract - ABC Corporation
        </Text>
        <View style={styles.analysisStatus}>
          <Clock size={16} color="#059669" strokeWidth={2} />
          <Text style={styles.statusText}>Analyzed 2 hours ago</Text>
        </View>
      </View>

      {/* Language Selector */}
      <LanguageSelector 
        selected={selectedLanguage} 
        onSelect={setSelectedLanguage} 
      />

      {/* Analysis Score */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Contract Safety Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>72</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <Text style={styles.scoreLabel}>Moderate Risk</Text>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: '72%', backgroundColor: '#F59E0B' }]} />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Analysis Results */}
      <View style={styles.resultsSection}>
        {analysisData.map((item, index) => (
          <AnalysisCard
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            severity={item.severity}
            details={item.details}
          />
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>AI Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            This employment contract has some concerning clauses that could disadvantage you. 
            The termination clause violates BCEA requirements, and the non-compete period is 
            excessive. However, payment terms are fair and comply with labour law. 
            Consider negotiating the problematic clauses before signing.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.primaryButton}>
          <MessageSquare size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.primaryButtonText}>Generate Counter-Offer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Globe size={16} color="#1E40AF" strokeWidth={2} />
          <Text style={styles.secondaryButtonText}>Consult Human Lawyer</Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
  },
  analysisStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#059669',
    marginLeft: 4,
  },
  languageSelector: {
    padding: 20,
    paddingTop: 0,
  },
  languageSelectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  languageOptionSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  languageFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  languageText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  languageTextSelected: {
    color: '#FFFFFF',
  },
  scoreSection: {
    padding: 20,
    paddingTop: 0,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
  },
  scoreOutOf: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginBottom: 16,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  cardDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  summarySection: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
  },
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1E40AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
});