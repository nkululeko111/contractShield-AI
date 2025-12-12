import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Zap, MessageSquare, Globe, Clock, Upload, FileText } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

type Severity = 'high' | 'medium' | 'low' | 'info';

interface AnalysisItem {
  icon: string;
  title: string;
  description: string;
  severity: Severity;
  details: string;
}

interface ContractDetails {
  startDate?: string;
  endDate?: string;
  compensation?: string;
  benefits?: string[];
  terminationClause?: string;
  keyLoopholes?: string[];
}

interface CategoryItem {
  icon: string;
  title: string;
  description: string;
  assessment: string;
  severity: Severity;
}

interface RedFlag {
  icon: string;
  title: string;
  severity: Severity;
  description: string;
  clause?: string;
  legalImplication: string;
  riskLevel?: string;
}

interface LoopholeItem {
  icon: string;
  title: string;
  severity: Severity;
  issues: string[];
  exposure: string;
}

interface AdviceItem {
  icon: string;
  title: string;
  current: string;
  suggested: string;
  reasoning: string;
  priority?: string;
}

interface AnalysisData {
  score: number;
  overview?: string;
  analysis?: AnalysisItem[];
  contractDetails?: ContractDetails;
  aiSummary?: string;
  overviewCategories?: Record<string, CategoryItem>;
  redFlags?: RedFlag[];
  loopholesBreakdown?: Record<string, LoopholeItem>;
  negotiationAdvice?: Record<string, AdviceItem>;
}

interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: Severity;
  details: string;
}

const AnalysisCard = ({ icon, title, description, severity, details, children }: AnalysisCardProps & { children?: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(false);
  
  const severityColors: Record<Severity, string> = {
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
          {children ? children : <Text style={styles.detailsText}>{details}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// (removed alias — a dedicated Card component exists below)

interface CardProps {
  icon: React.ReactNode;
  title: string;
  severity?: Severity;
  children: React.ReactNode;
}

const Card = ({ icon, title, severity = 'info', children }: CardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const severityColors: Record<Severity, string> = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#059669',
    info: '#1E40AF',
  };

  return (
    <TouchableOpacity 
      style={[styles.analysisCard, { borderLeftColor: severityColors[severity] }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconContainer, { backgroundColor: severityColors[severity] + '20' }]}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </View>
      
      {expanded && (
        <View style={styles.cardDetails}>
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
};

const API_BASE_URL = 'http://localhost:5000/api';

// Default demo data to prevent undefined errors
const DEFAULT_ANALYSIS_DATA: AnalysisData = {
  score: 72,
  overview: "This employment contract has some concerning clauses that could disadvantage you. The termination clause violates BCEA requirements, and the non-compete period is excessive. However, payment terms are fair and comply with labour law. Consider negotiating the problematic clauses before signing.",
  analysis: [
    {
      icon: "alert-triangle",
      title: "Illegal Termination Clause",
      description: "Clause 4.2 violates BCEA Section 188",
      severity: "high",
      details: "The contract allows termination without proper notice period required by the Basic Conditions of Employment Act. This clause is unenforceable and you can challenge it legally."
    },
    {
      icon: "zap",
      title: "Unfair Non-Compete",
      description: "6-month restriction may be excessive",
      severity: "medium",
      details: "The non-compete clause extends for 6 months which may be deemed unreasonable by SA courts. Consider negotiating down to 3 months or adding geographic limitations."
    },
    {
      icon: "check-circle",
      title: "Fair Salary Payment",
      description: "Payment terms comply with labour law",
      severity: "low",
      details: "Monthly salary payments within 7 days of month-end comply with standard employment practices and BCEA requirements."
    },
    {
      icon: "message-square",
      title: "Missing Dispute Resolution",
      description: "No clear process for handling disputes",
      severity: "info",
      details: "The contract lacks a dispute resolution mechanism. Consider adding a clause requiring mediation before litigation to save costs."
    }
  ]
};

// Safe data normalization function
const normalizeAnalysisData = (data: any): AnalysisData => {
  if (!data) {
    return DEFAULT_ANALYSIS_DATA;
  }

  return {
    score: typeof data.score === 'number' ? data.score : DEFAULT_ANALYSIS_DATA.score,
    overview: data.overview || data.aiSummary || DEFAULT_ANALYSIS_DATA.overview,
    analysis: Array.isArray(data.analysis) ? data.analysis : DEFAULT_ANALYSIS_DATA.analysis,
    contractDetails: data.contractDetails || undefined,
    aiSummary: data.aiSummary || data.overview || undefined,
    overviewCategories: data.overviewCategories || undefined,
    redFlags: Array.isArray(data.redFlags) ? data.redFlags : undefined,
    loopholesBreakdown: data.loopholesBreakdown || undefined,
    negotiationAdvice: data.negotiationAdvice || undefined,
  };
};

export default function AnalysisScreen() {
  const searchParams = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisData, setAnalysisData] = useState<AnalysisData>(DEFAULT_ANALYSIS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Contract');
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Load analysis from route parameters or fetch sample
  useEffect(() => {
    const analysisString = searchParams.analysis as string | undefined;
    const fileNameString = searchParams.fileName as string | undefined;
    
    console.log('Route params:', { analysis: analysisString, fileName: fileNameString });
    
    if (analysisString) {
      try {
        console.log('Parsing analysis from params...');
        const parsedAnalysis = JSON.parse(analysisString);
        console.log('Parsed analysis:', parsedAnalysis);
        
        if (parsedAnalysis && parsedAnalysis.score !== undefined) {
          const normalizedData = normalizeAnalysisData(parsedAnalysis);
          setAnalysisData(normalizedData);
          setRawResponse(parsedAnalysis);
          setFileName(fileNameString || 'Contract');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error parsing analysis:', err);
      }
    }
    
    // Fallback to sample analysis
    console.log('Loading sample analysis...');
    fetchSampleAnalysis();
  }, [searchParams.analysis, searchParams.fileName]);

  const fetchSampleAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sampleContractText = `
EMPLOYMENT CONTRACT

This Employment Contract ("Contract") is made between ABC Corporation ("Employer") and [Employee Name] ("Employee").

1. COMMENCEMENT DATE
The employment will commence on 1st January 2024.

2. REMUNERATION
The Employee will be paid a monthly salary of R25,000, payable within 7 days after the end of each month.

3. WORKING HOURS
The Employee will work from 8:00 AM to 5:00 PM, Monday to Friday.

4. TERMINATION
Either party may terminate this agreement with 24 hours notice. The Employer may terminate immediately for gross misconduct.

5. NON-COMPETE
The Employee agrees not to work for any competing business within a 100km radius for 12 months after termination.

6. INTELLECTUAL PROPERTY
All work created during employment belongs to the Employer.

7. CONFIDENTIALITY
The Employee must keep all company information confidential indefinitely.

8. DISPUTE RESOLUTION
Any disputes will be resolved through binding arbitration.
      `;

      const response = await fetch(`${API_BASE_URL}/analyze/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sampleContractText,
          language: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setRawResponse(result);
      
      if (result.success && result.analysis) {
        // Normalize the data to ensure it has the correct structure
        const normalizedData = normalizeAnalysisData(result.analysis);
        setAnalysisData(normalizedData);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: unknown) {
      console.error('Analysis fetch error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to analyze contract');
      // Use default data if API fails
      setAnalysisData(DEFAULT_ANALYSIS_DATA);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'alert-triangle':
        return <AlertTriangle size={20} color="#DC2626" strokeWidth={2} />;
      case 'zap':
        return <Zap size={20} color="#F59E0B" strokeWidth={2} />;
      case 'check-circle':
        return <CheckCircle size={20} color="#059669" strokeWidth={2} />;
      case 'message-square':
        return <MessageSquare size={20} color="#1E40AF" strokeWidth={2} />;
      default:
        return <AlertTriangle size={20} color="#6B7280" strokeWidth={2} />;
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  // Safe data access
  const score = analysisData?.score || 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contract Analysis</Text>
        <Text style={styles.headerSubtitle}>
          {fileName} - {new Date().toLocaleDateString()}
        </Text>
        <View style={styles.analysisStatus}>
          <Clock size={16} color="#059669" strokeWidth={2} />
          <Text style={styles.statusText}>Analyzed just now</Text>
        </View>
      </View>

      {/* Analysis Score */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Contract Safety Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>
              {loading ? '--' : score}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <Text style={styles.scoreLabel}>
            {score >= 80 ? 'Low Risk' : 
             score >= 60 ? 'Moderate Risk' : 'High Risk'}
          </Text>
          <View style={styles.scoreBar}>
            <View style={[
              styles.scoreBarFill, 
              { 
                width: `${score}%`, 
                backgroundColor: score >= 80 ? '#059669' : 
                                score >= 60 ? '#F59E0B' : '#DC2626' 
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'redflags', label: 'Red Flags' },
          { id: 'loopholes', label: 'Loopholes' },
          { id: 'negotiate', label: 'Negotiate' },
        ].map((tab) => (
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

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingSectionText}>Analyzing contract...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorSection}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Showing demo analysis</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSampleAnalysis}>
            <Text style={styles.retryButtonText}>Retry Analysis</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analysis Results */}
      {!loading && (
        <View style={styles.resultsSection}>
          {activeTab === 'overview' && (
            <View>
              {analysisData.contractDetails && (
                <View style={styles.detailsBox}>
                  <Text style={styles.cardLabel}>Start Date:</Text>
                  <Text style={styles.cardValue}>{analysisData.contractDetails.startDate || 'Not specified'}</Text>
                  
                  <Text style={styles.cardLabel}>End Date:</Text>
                  <Text style={styles.cardValue}>{analysisData.contractDetails.endDate || 'Not specified'}</Text>
                  
                  <Text style={styles.cardLabel}>Compensation:</Text>
                  <Text style={styles.cardValue}>{analysisData.contractDetails.compensation || 'Not specified'}</Text>
                  
                  {analysisData.contractDetails.benefits && analysisData.contractDetails.benefits.length > 0 && (
                    <>
                      <Text style={styles.cardLabel}>Benefits:</Text>
                      {analysisData.contractDetails.benefits.map((benefit: string, idx: number) => (
                        <Text key={idx} style={styles.cardValue}>• {benefit}</Text>
                      ))}
                    </>
                  )}
                </View>
              )}
              
              {analysisData.overviewCategories && Object.entries(analysisData.overviewCategories).map(([key, category]: any) => (
                <Card key={key} icon={getIconComponent(category.icon)} title={category.title} severity={category.severity}>
                  <Text style={styles.cardLabel}>Details:</Text>
                  <Text style={styles.cardValue}>{category.description}</Text>
                  <Text style={styles.cardLabel}>Assessment:</Text>
                  <Text style={styles.cardValue}>{category.assessment}</Text>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'redflags' && (
            <View>
              {analysisData.redFlags && analysisData.redFlags.length > 0 ? (
                analysisData.redFlags.map((flag: any, idx: number) => (
                  <Card key={idx} icon={getIconComponent(flag.icon)} title={flag.title} severity={flag.severity}>
                    <Text style={styles.cardLabel}>Clause:</Text>
                    <Text style={styles.cardValue}>{flag.clause || 'N/A'}</Text>
                    <Text style={styles.cardLabel}>Issue:</Text>
                    <Text style={styles.cardValue}>{flag.description}</Text>
                    <Text style={styles.cardLabel}>Legal Implication:</Text>
                    <Text style={styles.cardValue}>{flag.legalImplication}</Text>
                    <Text style={styles.cardLabel}>Risk Level:</Text>
                    <Text style={[styles.cardValue, { color: flag.severity === 'high' ? '#DC2626' : '#F59E0B' }]}>
                      {flag.riskLevel}
                    </Text>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyState}>No red flags detected</Text>
              )}
            </View>
          )}

          {activeTab === 'loopholes' && (
            <View>
              {analysisData.loopholesBreakdown && Object.entries(analysisData.loopholesBreakdown).map(([key, loophole]: any) => (
                <Card key={key} icon={getIconComponent(loophole.icon)} title={loophole.title} severity={loophole.severity}>
                  {loophole.issues && loophole.issues.map((issue: string, idx: number) => (
                    <Text key={idx} style={styles.cardValue}>• {issue}</Text>
                  ))}
                  <Text style={[styles.cardLabel, { marginTop: 8 }]}>Exposure:</Text>
                  <Text style={styles.cardValue}>{loophole.exposure}</Text>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'negotiate' && (
            <View>
              {analysisData.negotiationAdvice && Object.entries(analysisData.negotiationAdvice).map(([key, advice]: any) => (
                <Card key={key} icon={getIconComponent(advice.icon)} title={advice.title}>
                  <Text style={styles.cardLabel}>Current:</Text>
                  <Text style={[styles.cardValue, styles.currentText]}>"{advice.current}"</Text>
                  <Text style={styles.cardLabel}>Suggested:</Text>
                  <Text style={[styles.cardValue, styles.suggestedText]}>"{advice.suggested}"</Text>
                  <Text style={styles.cardLabel}>Why:</Text>
                  <Text style={styles.cardValue}>{advice.reasoning}</Text>
                  <Text style={[styles.cardLabel, { marginTop: 8 }]}>Priority:</Text>
                  <Text style={[styles.cardValue, { color: '#DC2626' }]}>{advice.priority}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      )}

      {/* AI Summary */}
      {!loading && analysisData.aiSummary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Contract Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              {analysisData.aiSummary}
            </Text>
          </View>
        </View>
      )}

        {/* Raw backend response (debug) */}
        {rawResponse && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <TouchableOpacity style={styles.outlineButton} onPress={() => setShowRaw(!showRaw)}>
              <Text style={styles.outlineButtonText}>{showRaw ? 'Hide' : 'Show'} Backend Raw Response</Text>
            </TouchableOpacity>

            {showRaw && (
              <View style={[styles.summaryCard, { marginTop: 12, maxHeight: 300 }] }>
                <Text style={[styles.summaryText, { fontSize: 12 }]}>
                  {JSON.stringify(rawResponse, null, 2)}
                </Text>
              </View>
            )}
          </View>
        )}

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

        <TouchableOpacity 
          style={styles.outlineButton}
          onPress={fetchSampleAnalysis}
        >
          <FileText size={16} color="#1E40AF" strokeWidth={2} />
          <Text style={styles.outlineButtonText}>Re-analyze Contract</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
  loadingSection: {
    padding: 40,
    alignItems: 'center',
  },
  loadingSectionText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  errorSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailsBox: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 20,
  },
  currentText: {
    fontStyle: 'italic',
    color: '#DC2626',
  },
  suggestedText: {
    fontStyle: 'italic',
    color: '#059669',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  summarySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginLeft: 8,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E40AF',
  },
  outlineButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginLeft: 8,
  },
});